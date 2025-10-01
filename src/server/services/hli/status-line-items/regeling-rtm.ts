import { isAfter } from 'date-fns';

import {
  BESLUIT,
  EINDE_RECHT,
  getBesluitDescription,
  isAanvrager,
} from './generic';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import { sortByNumber } from '../../../../universal/helpers/utils';
import {
  GenericDocument,
  StatusLineItem,
} from '../../../../universal/types/App.types';
import { parseLabelContent } from '../../zorgned/zorgned-helpers';
import {
  TextPartContents,
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-types';
import type { ZorgnedHLIRegeling } from '../hli-regelingen-types';

// Toets voorwaarden voor een afspraak GGD
export const AV_RTM_DEEL1 = 'AV-RTM1';
// Afhandeling afspraak GGD
export const AV_RTM_DEEL2 = 'AV-RTM';

export const RTM_STATUS_IN_BEHANDELING = 'In behandeling genomen';

export function isRTMDeel2(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  return (
    !!aanvraag.productIdentificatie &&
    AV_RTM_DEEL2 === aanvraag.productIdentificatie
  );
}

export function isRTMDeel1(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  return (
    !!aanvraag.productIdentificatie &&
    AV_RTM_DEEL1 === aanvraag.productIdentificatie
  );
}

/** Aanvragen can contain duplicate RTMDeel2. We combine the documents and drop the dupe. */
function dedupCombineRTMDeel2(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
) {
  const dedupedAanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[] = [];
  const seenAanvragen: Record<string, ZorgnedHLIRegeling> = {};

  for (const aanvraag of structuredClone(aanvragen)) {
    if (!isRTMDeel2(aanvraag)) {
      dedupedAanvragen.push(aanvraag);
      continue;
    }
    const id = `${aanvraag.procesAanvraagOmschrijving}-${aanvraag.beschiktProductIdentificatie}`;
    if (seenAanvragen[id]) {
      seenAanvragen[id].documenten.push(...aanvraag.documenten);
      continue;
    }
    seenAanvragen[id] = aanvraag;
    dedupedAanvragen.push(aanvraag);
  }
  return dedupedAanvragen;
}

export function filterCombineRtmData(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
): [ZorgnedAanvraagWithRelatedPersonsTransformed[], RTMCombinedRegeling[]] {
  const rtmAanvragen = [];
  const remainder = [];

  for (const aanvraag of aanvragen) {
    if (isRTMDeel1(aanvraag) || isRTMDeel2(aanvraag)) {
      rtmAanvragen.push(aanvraag);
    } else {
      remainder.push(aanvraag);
    }
  }

  // Prevent aanvragen from other 'betrokkenen' sets from being mixed up with eachother.
  const aanvragenPerBetrokkenen = mapAanvragenPerBetrokkenen(rtmAanvragen);
  return [
    remainder,
    Object.values(aanvragenPerBetrokkenen).flatMap(combineRTMData),
  ];
}

type RTMCombinedRegeling = [ZorgnedHLIRegeling, StatusLineItem[]];

type IncompleteRTMCombinedRegeling = [
  ZorgnedHLIRegeling,
  IncompleteStatusLineItem[],
];

/** Combine related aanvragen into one aanvraag all the way untill the aanvraag that cancels (Einde recht) it.
 *
 *  This requires a list of aanvragen for one person.
 *
 * ## Scenarios
 *
 *  2m - 1h - 2h - 1h - 2h.x   1t - 2 - 1h - 2h - 1h - 2h.x    1t - 2.x    1t - 2 - 1h - 2h - 1h - 2h.x
 * |________________________| |____________________________|  |________|  |___________________________|
 *
 *  1a
 * |__|
 *
 * 1t = RTM1 toegewezen
 * 1a = RTM1 afgewezen
 * 1h = Aanvraag Aanpassing (herkeuring)
 * 2 = RTM
 * 2h = RTM Aanpassing (obv herkeuring)
 * 2m = RTM migratie (hier zit nooit een fase 1 voor)
 * 2x = RTM + datum einde geldigheid verstreken
 * 2h.x = RTM Aanpassing (herkeurd) + datum einde geldigheid verstreken
 */
function combineRTMData(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
): RTMCombinedRegeling[] {
  aanvragen = aanvragen
    // Sort asc so we always end with an 'Einde recht'.
    // This keeps it in the same order as how we describe the scenarios, so you don't need to think in reverse.
    .toSorted(sortByNumber('id', 'asc'));

  aanvragen = dedupCombineRTMDeel2(aanvragen);

  const regelingen = aanvragen.map((aanvraag) => {
    const regeling: ZorgnedHLIRegeling = {
      ...aanvraag,
      datumInBehandeling: aanvraag.datumBesluit,
    };
    return regeling;
  });

  const firstRegeling = regelingen.shift();
  if (!firstRegeling) {
    return [];
  }

  const combinedRegelingen: IncompleteRTMCombinedRegeling[] = [
    [
      removeDocuments(firstRegeling),
      getStatusLineItems(firstRegeling, 'startOfChain'),
    ],
  ];

  for (const regeling of regelingen) {
    const lastItem = combinedRegelingen.pop();
    if (lastItem === undefined) {
      throw new Error('lastItem shoulld always be defined');
    }

    const [lastRegeling, lastStatusLineItems] = lastItem;

    if (
      lastRegeling.procesAanvraagOmschrijving === 'Beëindigen RTM' &&
      lastRegeling.isActueel === false
    ) {
      combinedRegelingen.push([
        removeDocuments(regeling),
        getStatusLineItems(regeling, 'startOfChain'),
      ]);
      continue;
    }

    const statusLineItems = getStatusLineItems(regeling, 'afterAanvraag');
    const mergedStatusLineItems: IncompleteStatusLineItem[] = [
      ...lastStatusLineItems,
      ...statusLineItems,
    ];
    const combinedRegeling: IncompleteRTMCombinedRegeling = [
      {
        ...removeDocuments(regeling),
        datumInBehandeling: lastRegeling.datumInBehandeling,
        datumAanvraag: lastRegeling.datumAanvraag ?? regeling.datumAanvraag,
      },
      mergedStatusLineItems,
    ];
    combinedRegelingen.push(combinedRegeling);
  }

  const [lastCombinedRegeling, lastStatusLine] =
    combinedRegelingen[combinedRegelingen.length - 1];

  if (
    lastCombinedRegeling.procesAanvraagOmschrijving !== 'Beëindigen RTM' &&
    !(
      isRTMDeel1(lastCombinedRegeling) &&
      lastCombinedRegeling.resultaat === 'afgewezen'
    )
  ) {
    const getStatusLineItem = createGetStatusLineItemFn(lastCombinedRegeling);
    lastStatusLine.push(getStatusLineItem('eindeRecht'));
  }

  return combinedRegelingen.map(([regeling, statusLineItems]) => {
    return [regeling, finalizeStatusLineItems(statusLineItems)];
  });
}

function removeDocuments(regeling: ZorgnedHLIRegeling): ZorgnedHLIRegeling {
  return { ...regeling, documenten: [] };
}

/** Determines active step and checks untill there (including), and adds ids */
function finalizeStatusLineItems(
  statusLineItems: IncompleteStatusLineItem[]
): StatusLineItem[] {
  const lastIdx = statusLineItems.length - 1;
  const lastItem = statusLineItems[lastIdx];

  if (statusLineItems.length === 1) {
    lastItem.isActive = true;
  } else if (lastItem.status === 'Einde recht' && !lastItem.isActive) {
    statusLineItems[lastIdx - 1].isActive = true;
  }

  const statusLineItemsComplete: StatusLineItem[] = statusLineItems.map(
    (item, i) => {
      return {
        ...item,
        id: `status-step-${i + 1}`,
        isActive: item.isActive ?? false,
      };
    }
  );

  const checkedSteps = checkUntillIncludingActiveStep(statusLineItemsComplete);

  // TODO: Remove this check for development.
  let count = 0;
  checkedSteps.forEach((step) => {
    if (step.isActive === true) {
      count++;
    }
  });
  if (count > 1 || count <= 0) {
    // eslint-disable-next-line no-console
    console.dir(statusLineItemsComplete, { depth: 10 });
    throw Error(`Statustrain has ${count} active steps`);
  }

  return checkedSteps;
}

function checkUntillIncludingActiveStep(
  statusLineItems: StatusLineItem[]
): StatusLineItem[] {
  let shouldCheck = true;

  const newSteps = statusLineItems.map((statusLineItem) => {
    const isChecked = shouldCheck;
    if (statusLineItem.isActive) {
      shouldCheck = false;
    }
    return {
      ...statusLineItem,
      isChecked,
    };
  });

  return newSteps;
}

type Context = 'startOfChain' | 'afterAanvraag';

type StatusLineItemTransformerConfig = {
  status: string;
  datePublished: TextPartContents<ZorgnedHLIRegeling>;
  description: TextPartContents<ZorgnedHLIRegeling>;
  documents: (regeling: ZorgnedHLIRegeling) => GenericDocument[];
  isActive?: (regeling: ZorgnedHLIRegeling, now: Date) => boolean;
};

type StatusLineKeys =
  | 'aanvraagLopend'
  | 'aanvraagAfgewezen'
  | 'inBehandelingGenomen'
  | 'besluit'
  | 'wijzingsAanvraag'
  | 'wijziginsBesluit'
  | 'eindeRecht';

const getDatumAfgifte = (regeling: ZorgnedHLIRegeling) =>
  regeling.datumInBehandeling || regeling.datumBesluit;

const statusLineItems: Record<StatusLineKeys, StatusLineItemTransformerConfig> =
  {
    aanvraagLopend: {
      status: 'Aanvraag',
      datePublished: getDatumAfgifte,
      description: '',
      // The documents are in 'Aanvraag' above.
      documents: () => [],
    },
    aanvraagAfgewezen: {
      status: 'Besluit',
      datePublished: getDatumAfgifte,
      description: getBesluitDescription,
      documents: (regeling) => regeling.documenten,
    },
    inBehandelingGenomen: {
      status: 'In behandeling genomen',
      datePublished: getDatumAfgifte,
      description: (regeling) => getRtmDescriptionDeel1Toegewezen(regeling),
      documents: (regeling) => regeling.documenten,
    },
    besluit: {
      status: 'Besluit',
      datePublished: getDatumAfgifte,
      description: getBesluitDescription,
      documents: (regeling) => regeling.documenten,
    },
    wijzingsAanvraag: {
      status: 'Aanvraag wijziging',
      datePublished: getDatumAfgifte,
      description: `<p>U heeft een aanvraag gedaan voor aanpassing op uw lopende RTM regeling.</p>
        <p>Hiervoor moet u een afspraak maken voor een medisch gesprek bij de GGD. In de brief staat hoe u dat doet.</p>`,
      documents: (regeling) => regeling.documenten,
    },
    wijziginsBesluit: {
      status: 'Besluit wijziging',
      datePublished: getDatumAfgifte,
      description:
        '<p>Uw aanvraag voor een wijziging is afgehandeld. Bekijk de brief voor meer informatie hierover.</p>',
      documents: (regeling) => regeling.documenten,
    },
    eindeRecht: {
      status: 'Einde recht',
      datePublished: (regeling) => regeling.datumEindeGeldigheid || '',
      description: (regeling) => {
        if (
          !!regeling.datumEindeGeldigheid &&
          isAfter(new Date(), regeling.datumEindeGeldigheid)
        ) {
          return `
        <p>Uw recht op ${regeling.titel} is beëindigd per ${defaultDateFormat(regeling.datumEindeGeldigheid)}.</p><p>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>`;
        }
        return getNotEveryYearDescription(regeling);
      },
      documents: (regeling) => regeling.documenten,
      isActive(regeling, now) {
        return !!(
          regeling.isActueel === false &&
          regeling.datumEindeGeldigheid &&
          isAfter(now, regeling.datumEindeGeldigheid)
        );
      },
    },
  };

// TODO: Make a better type.
// Explicitly set isActive steps are the truth and will be used instead of determined.
type IncompleteStatusLineItem = Omit<StatusLineItem, 'id' | 'isActive'> & {
  isActive: boolean | null;
};

type getStatusLineItemFn = (
  itemChoice: StatusLineKeys
) => IncompleteStatusLineItem;

function createGetStatusLineItemFn(
  regeling: ZorgnedHLIRegeling
): getStatusLineItemFn {
  return (itemChoice) => {
    const statusItem = statusLineItems[itemChoice];
    const now = new Date();

    return {
      status: statusItem.status,
      description: parseLabelContent<ZorgnedHLIRegeling>(
        statusItem.description,
        regeling,
        now,
        []
      ),
      datePublished: parseLabelContent<ZorgnedHLIRegeling>(
        statusItem.datePublished,
        regeling,
        now,
        []
      ) as string,
      documents: statusItem.documents(regeling),
      isActive: statusItem.isActive ? statusItem.isActive(regeling, now) : null,
      isChecked: false,
      // TODO: Do we need to define this?
      isVisible: true,
    };
  };
}

function getStatusLineItems(
  regeling: ZorgnedHLIRegeling,
  context: Context
): IncompleteStatusLineItem[] {
  const getStatusLineItem = createGetStatusLineItemFn(regeling);

  if (context === 'startOfChain') {
    if (isRTMDeel1(regeling)) {
      if (regeling.resultaat === 'afgewezen') {
        return [getStatusLineItem('aanvraagAfgewezen')];
      }
      return [
        getStatusLineItem('aanvraagLopend'),
        getStatusLineItem('inBehandelingGenomen'),
      ];
    }
    if (regeling.procesAanvraagOmschrijving === 'Migratie RTM') {
      return [getStatusLineItem('besluit')];
    }
    return [];
  } else if (context === 'afterAanvraag') {
    if (!regeling.procesAanvraagOmschrijving) {
      throw Error(
        'Regeling has nog procesAanvraagOmschrijving, is the mock data out of date?'
      );
    }
    switch (regeling.procesAanvraagOmschrijving) {
      case 'Beëindigen RTM': {
        return [getStatusLineItem('eindeRecht')];
      }
      case 'Aanvraag RTM fase 1': {
        return [getStatusLineItem('wijzingsAanvraag')];
      }
      case 'RTM Herkeuring': {
        return [getStatusLineItem('wijziginsBesluit')];
      }
      case 'Aanvraag RTM fase 2': {
        return [getStatusLineItem('besluit')];
      }
    }
    console.dir(regeling);
    throw Error('No statusstep found!');
  }

  throw Error('Did not find a fitting regelingen.procesAanvraagOmschrijving');
}

type AanvragenMap = {
  ontvanger: ZorgnedAanvraagWithRelatedPersonsTransformed[];
} & Record<string, ZorgnedAanvraagWithRelatedPersonsTransformed[]>;

function mapAanvragenPerBetrokkenen(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
): AanvragenMap {
  aanvragen = aanvragen.map((aanvraag) => {
    return {
      ...aanvraag,
      // Sort because I don't know if betrokkenen are always in the same order across different aanvragen.
      betrokkenen: aanvraag.betrokkenen.toSorted((a, b) => (a <= b ? -1 : 1)),
    };
  });

  const ontvangerID = aanvragen
    .find((aanvraag) => {
      return isRTMDeel2(aanvraag);
    })
    ?.betrokkenen.join('');

  const aanvragenMap: AanvragenMap = { ontvanger: [] };

  for (const aanvraag of aanvragen) {
    if (isRTMDeel2(aanvraag)) {
      aanvragenMap.ontvanger.push(aanvraag);
      continue;
    }

    const id = aanvraag.betrokkenen.join('');

    if (id === ontvangerID) {
      aanvragenMap.ontvanger.push(aanvraag);
      continue;
    }

    if (ontvangerID && aanvraag.betrokkenen.includes(ontvangerID)) {
      // An aanvraag can have multiple betrokkenen but also include the 'ontvanger'.
      // So we copy/split an aanvraag to the betrokkenen,
      // so we can merge the rtm-2 aanvragen that are only for the ontvanger.
      aanvraag.betrokkenen = aanvraag.betrokkenen.filter(
        (b) => b !== ontvangerID
      );
      aanvraag.betrokkenPersonen = aanvraag.betrokkenPersonen.filter(
        (b) => b.bsn !== ontvangerID
      );
      const aanvraagCopy = structuredClone(aanvraag);
      aanvraagCopy.betrokkenen = [ontvangerID];
      aanvragenMap.ontvanger.push(aanvraagCopy);
    }

    const aanvraagInMap = aanvragenMap[id];
    if (aanvraagInMap) {
      aanvragenMap[id].push(aanvraag);
    } else {
      aanvragenMap[id] = [aanvraag];
    }
  }

  return aanvragenMap;
}

function getRtmDescriptionDeel1Toegewezen(regeling: ZorgnedHLIRegeling) {
  let description = `<p>Voordat u de ${regeling.titel} krijgt, moet u een afspraak maken voor een medische keuring bij de GGD. In de brief staat hoe u dat doet.</p>`;

  // Betrokkenen always has the aanvrager listed as well.
  const isAanvraagVoorMeerdereBetrokkenen = regeling.betrokkenen.length > 1;

  if (isAanvraagVoorMeerdereBetrokkenen) {
    description += `<p><strong>Vraagt u de ${regeling.titel} (ook) voor andere gezinsleden aan?</strong><br/>De uitslag van de aanvraag is op Mijn Amsterdam te vinden met de DigiD login gegevens van uw gezinsleden.</p>
    <p>Nog geen DigiD login gegevens? <a rel="noopener noreferrer" href="https://www.digid.nl/aanvragen-en-activeren/digid-aanvragen">Ga naar DigiD aanvragen.</a></p>
    `;

    description += `<p><strong>Gedeeltelijke afwijzing voor u of uw gezinsleden?</strong><br/>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>`;
  }

  return description;
}

const INFO_LINK =
  'https://www.amsterdam.nl/werk-en-inkomen/regelingen-bij-laag-inkomen-pak-je-kans/regelingen-alfabet/extra-geld-als-u-chronisch-ziek-of/';

const getNotEveryYearDescription = (regeling: ZorgnedHLIRegeling) => `
<p>U hoeft de ${regeling.titel} niet elk jaar opnieuw aan te vragen. De gemeente verlengt de regeling stilzwijgend, maar controleert wel elk jaar of u nog in aanmerking komt.</p>
<p>U kunt dan ook een brief krijgen met het verzoek om extra informatie te geven.</p>
<p><a href="${INFO_LINK}">Als er wijzigingen zijn in uw situatie moet u die direct doorgeven</a>.</p>`;

const isEindeRechtForBetrokkenenActive = (regeling: ZorgnedHLIRegeling) =>
  isRTMDeel2(regeling) &&
  regeling.resultaat === 'toegewezen' &&
  regeling.isActueel === false &&
  !regeling.datumInBehandeling;

const isToegewezenEindeRecht = (regeling: ZorgnedHLIRegeling) =>
  !!regeling.datumInBehandeling && regeling.resultaat === 'toegewezen';

export const RTM: ZorgnedStatusLineItemTransformerConfig<ZorgnedHLIRegeling>[] =
  [
    // Besluit - afgewezen - voor RTM Deel 1. Betrokkenen krijgen deze stap nooit te zien.
    {
      ...BESLUIT,
      isActive(aanvraag) {
        return aanvraag.resultaat === 'afgewezen';
      },
      isVisible(aanvraag) {
        return isRTMDeel1(aanvraag) && aanvraag.resultaat === 'afgewezen';
      },
    },
    // Deel 1 is (deels) toegewezen. Alleen voor de aanvrager.
    {
      status: 'Aanvraag',
      isChecked: true,
      description: '',
      isVisible(aanvraag) {
        return (
          (isRTMDeel1(aanvraag) && aanvraag.resultaat === 'toegewezen') ||
          (isRTMDeel2(aanvraag) && 'datumInBehandeling' in aanvraag) // dateInBehandeling is een property die wordt togevoegd aan de aanvraag indien een deel1 aanvraag is toegewezen voor de aanvrager.
        );
      },
      isActive: false,
      datePublished(regeling) {
        return (
          /** if Deel2 */ regeling.datumInBehandeling ||
          /** if Deel1 */ regeling.datumBesluit
        );
      },
    },
    // In behandeling (in afwatching van uitslag GGD), alleen voor de aanvrager/ontvanger zónder betrokkenen.
    {
      status: RTM_STATUS_IN_BEHANDELING,
      isChecked: true,
      description: getRtmDescriptionDeel1Toegewezen,
      isVisible(aanvraag) {
        return (
          (isRTMDeel1(aanvraag) && aanvraag.resultaat === 'toegewezen') ||
          (isRTMDeel2(aanvraag) && 'datumInBehandeling' in aanvraag) // dateInBehandeling is een property die wordt toegevoegd aan de aanvraag indien een deel1 aanvraag is toegewezen voor de aanvrager.
        );
      },
      isActive(aanvraag) {
        return isRTMDeel1(aanvraag);
      },
      datePublished(regeling) {
        return (
          /** if Deel2 */ regeling.datumInBehandeling ||
          /** if Deel1 */ regeling.datumBesluit
        );
      },
    },
    // Besluit - afgewezen/toegewezen - voor RTM Deel 2. Voor zowel de aanvrager als de betrokkenen.
    // Betrokkkenen krijgen alléén deze stap (RTM Deel 2) te zien.
    {
      ...BESLUIT,
      isVisible: isRTMDeel2,
    },
    // Einde recht - voor RTM Deel 2. Voor de aanvrager.
    {
      ...EINDE_RECHT,
      isVisible(regeling) {
        return isRTMDeel2(regeling) && isToegewezenEindeRecht(regeling);
      },
      description(regeling) {
        if (
          !!regeling.datumEindeGeldigheid &&
          isAfter(new Date(), regeling.datumEindeGeldigheid)
        ) {
          return `
        <p>Uw recht op ${regeling.titel} is beëindigd per ${defaultDateFormat(regeling.datumEindeGeldigheid)}.</p><p>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>`;
        }
        return getNotEveryYearDescription(regeling);
      },
    },
    // Einde recht - voor RTM Deel 2. Voor de betrokkenen.
    {
      ...EINDE_RECHT,
      isVisible(regeling) {
        return isRTMDeel2(regeling) && !isToegewezenEindeRecht(regeling);
      },
      isChecked: isEindeRechtForBetrokkenenActive,
      isActive: isEindeRechtForBetrokkenenActive,
      description(regeling, today, allAanvragen) {
        const baseDescription =
          typeof EINDE_RECHT.description === 'function'
            ? EINDE_RECHT.description(regeling, today, allAanvragen)
            : EINDE_RECHT.description || '';
        // Betrokkenen always has the aanvrager listed as well.
        const isAanvraagVoorMeerdereBetrokkenen =
          regeling.betrokkenen.length > 1;
        const isAanvrager_ = isAanvrager(regeling);
        if (!isEindeRechtForBetrokkenenActive(regeling)) {
          return getNotEveryYearDescription(regeling);
        }
        if (!isAanvraagVoorMeerdereBetrokkenen) {
          return baseDescription;
        }
        // TODO: implement this description and look at the other fields.
        return (
          baseDescription +
          `<p>
            ${isAanvrager_ ? 'Wordt uw kind 18? Dan moet uw kind deze regeling voor zichzelf aanvragen.' : 'Bent u net of binnenkort 18 jaar oud? Dan moet u deze regeling voor uzelf aanvragen.'} <a href="${INFO_LINK}">Lees meer over de voorwaarden</a>.
          </p>
          `
        );
      },
    },
  ];

export const forTesting = {
  isRTMDeel2,
};
