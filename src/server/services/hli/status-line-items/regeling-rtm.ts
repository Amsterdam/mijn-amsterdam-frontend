import { isAfter } from 'date-fns';

import { getBesluitDescription, isAanvrager } from './generic';
import { featureToggle } from '../../../../client/pages/Thema/HLI/HLI-thema-config';
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
} from '../../zorgned/zorgned-types';
import type { ZorgnedHLIRegeling } from '../hli-regelingen-types';

// Toets voorwaarden voor een afspraak GGD
export const AV_RTM_DEEL1 = 'AV-RTM1';
// Afhandeling afspraak GGD
export const AV_RTM_DEEL2 = 'AV-RTM';

export const RTM_STATUS_IN_BEHANDELING = 'In behandeling genomen';

const INFO_LINK =
  'https://www.amsterdam.nl/werk-en-inkomen/regelingen-bij-laag-inkomen-pak-je-kans/regelingen-alfabet/extra-geld-als-u-chronisch-ziek-of/';

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
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[],
  bsnOntvanger: string
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

  if (!featureToggle.hliRegelingEnabledRTM) {
    return [remainder, []];
  }

  // Prevent aanvragen from other 'betrokkenen' sets from being mixed up with eachother.
  const aanvragenPerBetrokkenen = mapAanvragenPerBetrokkenen(
    rtmAanvragen,
    bsnOntvanger
  );
  return [
    remainder,
    Object.values(aanvragenPerBetrokkenen).flatMap(combineRTMData),
  ];
}

type AanvragenMap = {
  ontvanger: ZorgnedAanvraagWithRelatedPersonsTransformed[];
} & Record<string, ZorgnedAanvraagWithRelatedPersonsTransformed[]>;

function mapAanvragenPerBetrokkenen(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[],
  bsnOntvanger: string
): AanvragenMap {
  aanvragen = aanvragen.map((aanvraag) => {
    return {
      ...aanvraag,
      // Sort because I don't know if betrokkenen are always in the same order across different aanvragen.
      betrokkenen: aanvraag.betrokkenen.toSorted((a, b) => (a <= b ? -1 : 1)),
    };
  });

  const aanvragenMap: AanvragenMap = { ontvanger: [] };

  for (const aanvraag of aanvragen) {
    if (isRTMDeel2(aanvraag)) {
      aanvragenMap.ontvanger.push(aanvraag);
      continue;
    }

    const id = aanvraag.betrokkenen.join('');

    if (id === bsnOntvanger) {
      aanvragenMap.ontvanger.push(aanvraag);
      continue;
    }

    if (bsnOntvanger && aanvraag.betrokkenen.includes(bsnOntvanger)) {
      // An aanvraag can have multiple betrokkenen but also include the 'ontvanger'.
      // So we copy/split an aanvraag to the betrokkenen,
      // so we can merge the rtm-2 aanvragen that are only for the ontvanger.
      aanvraag.betrokkenen = aanvraag.betrokkenen.filter(
        (b) => b !== bsnOntvanger
      );
      aanvraag.betrokkenPersonen = aanvraag.betrokkenPersonen.filter(
        (b) => b.bsn !== bsnOntvanger
      );
      const aanvraagCopy = structuredClone(aanvraag);
      aanvraagCopy.betrokkenen = [bsnOntvanger];
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

type RTMCombinedRegeling = [ZorgnedHLIRegeling, StatusLineItem[]];

/** Combine related aanvragen into one aanvraag all the way untill the aanvraag that cancels (Einde recht) it.
 *  This requires a list of aanvragen for one person.
 */
function combineRTMData(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
): RTMCombinedRegeling[] {
  aanvragen = aanvragen
    // Sort asc so we always end with an 'Einde recht'.
    // This keeps it in the same order as how we describe the scenarios, so you don't need to think in reverse.
    .toSorted(sortByNumber('id', 'asc'));

  aanvragen = dedupCombineRTMDeel2(aanvragen);

  const groupedAanvragenPerRegeling = groupAanvragenPerRegeling(aanvragen);

  const combinedRegelingen = groupedAanvragenPerRegeling.reduce(
    (combinedRegelingen, aanvragen) => {
      const regeling = mergeAanvragenIntoRegeling(aanvragen);
      const lastAanvraag = aanvragen[aanvragen.length - 1];
      // A Afgewezen wijziging changes nothing about the active regeling.
      // So we put activate the regeling again.
      if (lastAanvraag.type === 'result-wijziging-afgewezen') {
        regeling.isActueel = true;
        regeling.resultaat = 'toegewezen';
      }

      const statusLineItems = getAllStatusLineItems(aanvragen);
      const combinedRegeling: RTMCombinedRegeling = [regeling, statusLineItems];
      return [...combinedRegelingen, combinedRegeling];
    },
    [] as RTMCombinedRegeling[]
  );

  return combinedRegelingen;
}

function groupAanvragenPerRegeling(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
): AanvraagWithType[][] {
  const groupedAanvragen: AanvraagWithType[][] = [];

  let group: AanvraagWithType[] = [];
  aanvragen.forEach((aanvraag, idx) => {
    const typed = createAanvraagWithType(aanvraag, aanvragen, idx);
    group.push(typed);

    if (
      typed.type === 'aanvraag-afgewezen' ||
      typed.type === 'result-einde-recht'
    ) {
      groupedAanvragen.push(group);
      group = [];
    }
  });
  if (group.length) {
    groupedAanvragen.push(group);
  }
  return groupedAanvragen;
}

function mergeAanvragenIntoRegeling(
  aanvragen: AanvraagWithType[]
): ZorgnedHLIRegeling {
  const [head, ...aanvragenTail] = aanvragen;
  const regeling = aanvragenTail.reduce(
    (regeling, aanvraag) => {
      if (aanvraag.type === 'result-wijziging-afgewezen') {
        return {
          ...regeling,
          datumBesluit: aanvraag.datumBesluit,
        };
      }
      return {
        ...aanvraag,
        // When a regeling is active and there is no einde recht, the regeling is
        // active indefinitely.
        datumEindeGeldigheid:
          aanvraag.type === 'result-einde-recht'
            ? aanvraag.datumEindeGeldigheid
            : null,
      };
    },
    { ...head, datumInBehandeling: head.datumBesluit }
  );
  // Documents are put in the statusLineItems.
  regeling.documenten = [];
  return regeling;
}

function getAllStatusLineItems(
  aanvragen: AanvraagWithType[]
): StatusLineItem[] {
  const incompleteStatusLineItems = aanvragen.reduce(
    (statusLineItems, aanvraag) => {
      return [...statusLineItems, ...getStatusLineItems(aanvraag)];
    },
    [] as IncompleteStatusLineItem[]
  );
  return finalizeStatusLineItems(incompleteStatusLineItems, aanvragen);
}

/** Determines active step and checks untill there (including), and adds ids */
function finalizeStatusLineItems(
  statusLineItems: IncompleteStatusLineItem[],
  aanvragen: AanvraagWithType[]
): StatusLineItem[] {
  const lastIdx = statusLineItems.length - 1;
  const lastItem = statusLineItems[lastIdx];

  const hasActiveStep = statusLineItems.some((item) => {
    return item.isActive;
  });
  if (!hasActiveStep) {
    if (statusLineItems.length === 1) {
      lastItem.isActive = true;
    } else if (lastItem.status === 'Einde recht' && !lastItem.isActive) {
      statusLineItems[lastIdx - 1].isActive = true;
    } else {
      lastItem.isActive = true;
    }
  }

  const lastAanvraag = aanvragen[aanvragen.length - 1];
  if (
    lastAanvraag.type !== 'result-afwijzing' &&
    statusLineItems.at(-1)?.status !== 'Einde recht' &&
    !(isRTMDeel1(lastAanvraag) && lastAanvraag.resultaat === 'afgewezen')
  ) {
    const getStatusLineItem = createGetStatusLineItemFn(lastAanvraag);
    const eindeRecht = getStatusLineItem(['defaultEindeRecht']);
    statusLineItems.push(...eindeRecht);
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

type StatusLineItemTransformerConfig = {
  status: string;
  datePublished: TextPartContents<ZorgnedHLIRegeling>;
  description: TextPartContents<ZorgnedHLIRegeling>;
  documents?: (
    aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
  ) => GenericDocument[];
  isActive?: (
    aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
  ) => boolean;
};

const getDatumAfgifte = (regeling: ZorgnedHLIRegeling) =>
  regeling.datumInBehandeling || regeling.datumBesluit;

type StatusLineKey =
  | 'aanvraagLopend'
  | 'aanvraagAfgewezen'
  | 'inBehandelingGenomen'
  | 'besluit'
  | 'wijzigingsAanvraag'
  | 'wijzigingsBesluit'
  | 'eindeRecht'
  | 'defaultEindeRecht';

const statusLineItems: Record<StatusLineKey, StatusLineItemTransformerConfig> =
  {
    aanvraagLopend: {
      status: 'Aanvraag',
      datePublished: getDatumAfgifte,
      description: '',
      // The documents are put in 'inBehandelingGenomen'.
      documents: () => [],
    },
    aanvraagAfgewezen: {
      status: 'Besluit',
      datePublished: getDatumAfgifte,
      description: getBesluitDescription,
      documents: (aanvraag) => aanvraag.documenten,
    },
    inBehandelingGenomen: {
      status: 'In behandeling genomen',
      datePublished: getDatumAfgifte,
      description: (aanvraag) => {
        let description = `<p>Voordat u de ${aanvraag.titel} krijgt, moet u een afspraak maken voor een medische keuring bij de GGD. In de brief staat hoe u dat doet.</p>`;

        if (aanvraag.betrokkenen.length > 1) {
          description += `<p><strong>Vraagt u de ${aanvraag.titel} (ook) voor andere gezinsleden aan?</strong><br/>De uitslag van de aanvraag is op Mijn Amsterdam te vinden met de DigiD login gegevens van uw gezinsleden.</p>
          <p>Nog geen DigiD login gegevens? <a rel="noopener noreferrer" href="https://www.digid.nl/aanvragen-en-activeren/digid-aanvragen">Ga naar DigiD aanvragen.</a></p>
          `;
          description += `<p><strong>Gedeeltelijke afwijzing voor u of uw gezinsleden?</strong><br/>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>`;
        }

        return description;
      },
      documents: (aanvraag) => aanvraag.documenten,
    },
    besluit: {
      status: 'Besluit',
      datePublished: getDatumAfgifte,
      description: getBesluitDescription,
      documents: (aanvraag) => aanvraag.documenten,
    },
    wijzigingsAanvraag: {
      status: 'Aanvraag wijziging',
      datePublished: getDatumAfgifte,
      description: `<p>U heeft een aanvraag gedaan voor aanpassing op uw lopende RTM regeling.</p>
<p>Hiervoor moet u een afspraak maken voor een medisch gesprek bij de GGD. In de brief staat hoe u dat doet.</p>`,
      documents: (aanvraag) => aanvraag.documenten,
    },
    wijzigingsBesluit: {
      status: 'Besluit wijziging',
      datePublished: getDatumAfgifte,
      description:
        '<p>Uw aanvraag voor een wijziging is afgehandeld. Bekijk de brief voor meer informatie hierover.</p>',
      documents: (aanvraag) => aanvraag.documenten,
    },
    eindeRecht: {
      status: 'Einde recht',
      datePublished: (aanvraag) => aanvraag.datumEindeGeldigheid || '',
      description: (aanvraag) => {
        const base = `<p>Uw recht op ${aanvraag.titel} is beëindigd per ${defaultDateFormat(aanvraag.datumEindeGeldigheid || '')}.</p><p>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>`;
        const isAanvraagForChild =
          aanvraag.betrokkenen.length &&
          !aanvraag.betrokkenen.includes(aanvraag.bsnAanvrager);
        if (!isAanvrager(aanvraag)) {
          return `${base}<p>Bent u net of binnenkort 18 jaar oud? Dan moet u deze regeling voor uzelf aanvragen.'} <a href="${INFO_LINK}">Lees meer over de voorwaarden</a>.</p>`;
        }
        if (isAanvraagForChild) {
          return `${base}
          <p>Wordt uw kind 18? Dan moet uw kind deze regeling voor zichzelf aanvragen.</p>`;
        }
        return base;
      },
      documents: (aanvraag) => aanvraag.documenten,
      isActive: () => true,
    },
    /** Default einde recht that is shown when a product is in a toegewezen RTM-2 state, einde recht is not actually present in the data in this case. */
    defaultEindeRecht: {
      status: 'Einde recht',
      datePublished: '',
      description: (regeling: ZorgnedHLIRegeling) => {
        return `
<p>U hoeft de ${regeling.titel} niet elk jaar opnieuw aan te vragen. De gemeente verlengt de regeling stilzwijgend, maar controleert wel elk jaar of u nog in aanmerking komt.</p>
<p>U kunt dan ook een brief krijgen met het verzoek om extra informatie te geven.</p>
<p><a href="${INFO_LINK}">Als er wijzigingen zijn in uw situatie moet u die direct doorgeven</a>.</p>`;
      },
      documents: () => [],
      isActive: () => false,
    },
  };

type IncompleteStatusLineItem = Omit<StatusLineItem, 'id' | 'isActive'> & {
  isActive: boolean | null;
};

type getStatusLineItemFn = (
  itemChoices: StatusLineKey[]
) => IncompleteStatusLineItem[];

function createGetStatusLineItemFn(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
): getStatusLineItemFn {
  return (itemChoices) => {
    const collectedStatusLineItems: IncompleteStatusLineItem[] = [];

    for (const choice of itemChoices) {
      const statusItem = statusLineItems[choice];
      const now = new Date();

      let documents: GenericDocument[] = [];
      if (typeof statusItem.documents === 'function') {
        documents = statusItem.documents(aanvraag);
      }

      const statusLineItem: IncompleteStatusLineItem = {
        status: statusItem.status,
        description: parseLabelContent<ZorgnedHLIRegeling>(
          statusItem.description,
          aanvraag,
          now,
          []
        ),
        datePublished: parseLabelContent<ZorgnedHLIRegeling>(
          statusItem.datePublished,
          aanvraag,
          now,
          []
        ) as string,
        documents,
        isActive: statusItem.isActive ? statusItem.isActive(aanvraag) : null,
        isChecked: false,
        isVisible: true,
      };

      collectedStatusLineItems.push(statusLineItem);
    }

    return collectedStatusLineItems;
  };
}

type AanvraagType =
  | null
  | 'aanvraag-toegewezen'
  | 'aanvraag-afgewezen'
  | 'aanvraag-wijziging'
  | 'result-migratie'
  | 'result-toegewezen'
  | 'result-afwijzing'
  | 'result-einde-recht'
  | 'result-wijziging-toegewezen'
  | 'result-wijziging-afgewezen';

type AanvraagWithType = ZorgnedHLIRegeling & { type: AanvraagType };

function createAanvraagWithType(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed,
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[],
  idx: number
): AanvraagWithType {
  const withType = (type: AanvraagType) => {
    return {
      ...aanvraag,
      type,
    };
  };

  if (idx === 0) {
    if (isRTMDeel1(aanvraag)) {
      if (aanvraag.resultaat === 'toegewezen') {
        return withType('aanvraag-toegewezen');
      }
      return withType('aanvraag-afgewezen');
    }
    if (aanvraag.procesAanvraagOmschrijving === 'Migratie RTM') {
      return withType('result-migratie');
    }

    if (aanvraag.resultaat === 'toegewezen') {
      return withType('result-toegewezen');
    }
    return withType('result-afwijzing');
  }

  if (isRTMDeel1(aanvraag)) {
    return withType('aanvraag-wijziging');
  }

  if (
    aanvraag.procesAanvraagOmschrijving === 'Beëindigen RTM' &&
    aanvraag.isActueel === false &&
    aanvraag.datumEindeGeldigheid &&
    isAfter(new Date(), aanvraag.datumEindeGeldigheid)
  ) {
    return withType('result-einde-recht');
  }

  if (isRTMDeel2(aanvraag)) {
    const previousAanvraag = aanvragen[idx - 1];
    if (idx >= 2 && isRTMDeel1(previousAanvraag)) {
      if (aanvraag.resultaat === 'toegewezen') {
        return withType('result-wijziging-toegewezen');
      }
      return withType('result-wijziging-afgewezen');
    }

    if (aanvraag.resultaat === 'toegewezen') {
      return withType('result-toegewezen');
    }
    return withType('result-afwijzing');
  }

  console.dir(aanvraag);
  throw Error('No type could be given to regeling');
}

function getStatusLineItems(
  aanvraagWithType: AanvraagWithType
): IncompleteStatusLineItem[] {
  const getStatusLineItem = createGetStatusLineItemFn(aanvraagWithType);
  switch (aanvraagWithType.type) {
    // RTM-1 Aanvragen
    case 'aanvraag-toegewezen': {
      return getStatusLineItem(['aanvraagLopend', 'inBehandelingGenomen']);
    }
    case 'aanvraag-afgewezen': {
      return getStatusLineItem(['aanvraagAfgewezen']);
    }
    // RTM-2 Resultaten
    case 'result-migratie': {
      return getStatusLineItem(['besluit']);
    }
    case 'result-toegewezen': {
      return getStatusLineItem(['besluit']);
    }
    case 'result-afwijzing': {
      return getStatusLineItem(['besluit']);
    }
    case 'result-einde-recht': {
      return getStatusLineItem(['eindeRecht']);
    }
    // Wijzigings process
    case 'aanvraag-wijziging': {
      return getStatusLineItem(['wijzigingsAanvraag']);
    }
    case 'result-wijziging-toegewezen': {
      return getStatusLineItem(['wijzigingsBesluit']);
    }
    case 'result-wijziging-afgewezen': {
      return getStatusLineItem(['wijzigingsBesluit']);
    }
    // TODO;
    // case 'result-wijziging-einde-recht': {
    // }
    default: {
      console.dir(aanvraagWithType);
      throw Error('No statusstep found!');
    }
  }
}
