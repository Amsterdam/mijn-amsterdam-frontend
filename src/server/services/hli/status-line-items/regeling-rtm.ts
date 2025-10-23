import { isAfter } from 'date-fns';

import { getBesluitDescription, isAanvrager } from './generic';
import { featureToggle } from '../../../../client/pages/Thema/HLI/HLI-thema-config';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import { sortAlpha } from '../../../../universal/helpers/utils';
import {
  GenericDocument,
  StatusLineItem,
} from '../../../../universal/types/App.types';
import { captureMessage } from '../../monitoring';
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

export function isRTMDeel1(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  return (
    !!aanvraag.productIdentificatie &&
    AV_RTM_DEEL1 === aanvraag.productIdentificatie
  );
}

export function isRTMDeel2(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  return (
    !!aanvraag.productIdentificatie &&
    AV_RTM_DEEL2 === aanvraag.productIdentificatie
  );
}

export function filterCombineRtmData(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[],
  bsnOntvanger: string
): [ZorgnedAanvraagWithRelatedPersonsTransformed[], RTMCombinedRegeling[]] {
  const [remainder, rtmAanvragen] = extractRTMAanvragen(aanvragen);

  if (!featureToggle.hliRegelingEnabledRTM) {
    return [remainder, []];
  }

  let aanvragenClean = dedupCombineRTMDeel2(rtmAanvragen);
  aanvragenClean = removeNonPdfDocuments(aanvragenClean);
  // Sort asc so we always end with an 'Einde recht'.
  // This keeps it in the same order as how we describe the scenarios, so you don't need to think in reverse.
  aanvragenClean.sort(sortAlpha('id', 'asc'));

  // Prevent aanvragen from other 'betrokkenen' sets from being mixed up with eachother.
  let aanvragenPerBetrokkenen = mapAanvragenPerBetrokkenen(
    aanvragenClean,
    bsnOntvanger
  );
  aanvragenPerBetrokkenen = removeExpiredIndividualAanvragen(
    aanvragenPerBetrokkenen
  );
  return [remainder, combineRTMData(aanvragenPerBetrokkenen)];
}

/** Aanvragen can contain duplicate RTMDeel2. We combine the documents and drop the dupe. */
function dedupCombineRTMDeel2(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
) {
  const dedupedAanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[] = [];
  const seenAanvragen: Record<string, ZorgnedHLIRegeling> = {};

  for (const aanvraag of aanvragen) {
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

function extractRTMAanvragen(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
): [
  ZorgnedAanvraagWithRelatedPersonsTransformed[],
  ZorgnedAanvraagWithRelatedPersonsTransformed[],
] {
  const remainder = [];
  const rtmAanvragen = [];
  for (const aanvraag of aanvragen) {
    if (isRTMDeel1(aanvraag) || isRTMDeel2(aanvraag)) {
      rtmAanvragen.push(aanvraag);
    } else {
      remainder.push(aanvraag);
    }
  }
  return [remainder, rtmAanvragen];
}

function removeNonPdfDocuments(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
): ZorgnedAanvraagWithRelatedPersonsTransformed[] {
  const withoutDocuments = aanvragen.map((aanvraag) => {
    return {
      ...aanvraag,
      documenten: aanvraag.documenten.filter((doc) => {
        // It is more likely that a document will be a pdf.
        // Therefore we will assume that to be true, when we cannot determine the filetype.
        if (!doc.filename) {
          return true;
        }
        return doc.filename.endsWith('pdf');
      }),
    };
  });
  return withoutDocuments;
}

type AanvragenPerBetrokkene = Record<
  string,
  ZorgnedAanvraagWithRelatedPersonsTransformed[]
> & {
  ontvanger: ZorgnedAanvraagWithRelatedPersonsTransformed[];
  orphaned: ZorgnedAanvraagWithRelatedPersonsTransformed[];
};

function mapAanvragenPerBetrokkenen(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[],
  bsnOntvanger: string
): AanvragenPerBetrokkene {
  aanvragen = aanvragen.map((aanvraag) => {
    return {
      ...aanvraag,
      // Sort because I don't know if betrokkenen are always in the same order across different aanvragen.
      betrokkenen: aanvraag.betrokkenen.toSorted((a, b) => (a <= b ? -1 : 1)),
    };
  });

  const aanvragenMap: AanvragenPerBetrokkene = { ontvanger: [], orphaned: [] };

  const foundBetrokkenenSets = aanvragen
    .filter((a) => a.betrokkenen.length > 0)
    .map((a) => a.betrokkenen.join(','));

  const hasAllAanvragenIdenticalBetrokkene =
    new Set(foundBetrokkenenSets).size === 1;

  if (hasAllAanvragenIdenticalBetrokkene) {
    const hasOntvanger = foundBetrokkenenSets.some((betrokkenen) =>
      betrokkenen.includes(bsnOntvanger)
    );
    if (hasOntvanger) {
      aanvragenMap.ontvanger = aanvragen;
      return aanvragenMap;
    }
    aanvragenMap[foundBetrokkenenSets.join('-')] = aanvragen;
    return aanvragenMap;
  }

  for (const aanvraag of aanvragen) {
    const betrokkenen = aanvraag.betrokkenen;
    if (!betrokkenen.length) {
      if (isRTMDeel2(aanvraag)) {
        aanvragenMap.ontvanger.push(aanvraag);
      } else {
        aanvragenMap.orphaned.push(aanvraag);
      }
    } else {
      // Copy/distribute aanvragen for every individual betrokkene.
      for (const bsn of betrokkenen) {
        if (bsn === bsnOntvanger) {
          aanvragenMap.ontvanger.push(aanvraag);
        } else {
          const newAanvraag = {
            ...aanvraag,
            betrokkenen: [bsn],
            betrokkenPersonen: aanvraag.betrokkenPersonen.filter(
              (p) => p.bsn === bsn
            ),
          };
          const aanvraagInMap = aanvragenMap[bsn];
          if (aanvraagInMap) {
            aanvragenMap[bsn].push(newAanvraag);
          } else {
            aanvragenMap[bsn] = [newAanvraag];
          }
        }
      }
    }
  }

  return aanvragenMap;
}

function removeExpiredIndividualAanvragen(
  aanvragen: AanvragenPerBetrokkene
): AanvragenPerBetrokkene {
  const aanvraagEntries = Object.entries(aanvragen).filter(([_, aanvragen]) => {
    return !(
      aanvragen.length === 1 &&
      isRTMDeel1(aanvragen[0]) &&
      isAfter(new Date(), aanvragen[0].datumEindeGeldigheid ?? '')
    );
  });

  return Object.fromEntries(aanvraagEntries) as AanvragenPerBetrokkene;
}

type RTMCombinedRegeling = [ZorgnedHLIRegeling, StatusLineItem[]];

function combineRTMData(
  aanvragenPerBetrokkene: AanvragenPerBetrokkene
): RTMCombinedRegeling[] {
  const regelingenForOntvanger = Object.entries(aanvragenPerBetrokkene).map(
    ([_betrokkene, aanvragen]) => processToRTMRegelingen(aanvragen)
  );
  return regelingenForOntvanger.flat();
}

function processToRTMRegelingen(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
): RTMCombinedRegeling[] {
  if (!aanvragen) {
    return [];
  }

  aanvragen = dedupCombineRTMDeel2(aanvragen);

  const groupedAanvragenPerRegeling = groupAanvragenPerRegeling(aanvragen).map(
    (aanvragen) => {
      let isRegelingBesluitToegewezenState = false;

      const aanvragenWithType = aanvragen.map((aanvraag, idx, aanvragen) => {
        const newAanvraag = createAanvraagWithType(
          aanvraag,
          isRegelingBesluitToegewezenState,
          aanvragen,
          idx
        );
        if (newAanvraag.type === 'result-toegewezen') {
          isRegelingBesluitToegewezenState = true;
        }
        return newAanvraag;
      });
      return aanvragenWithType;
    }
  );

  const combinedRegelingen = groupedAanvragenPerRegeling.reduce(
    (combinedRegelingen, aanvragen, i, groupedAanvragenPerRegeling) => {
      const regeling = mergeAanvragenIntoRegeling(aanvragen);
      const statusLineItems = getAllStatusLineItems(
        regeling,
        groupedAanvragenPerRegeling[i]
      );
      const combinedRegeling: RTMCombinedRegeling = [regeling, statusLineItems];
      return [...combinedRegelingen, combinedRegeling];
    },
    [] as RTMCombinedRegeling[]
  );

  return combinedRegelingen;
}

function groupAanvragenPerRegeling(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
): ZorgnedAanvraagWithRelatedPersonsTransformed[][] {
  const groupedAanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[][] = [];

  let group: ZorgnedAanvraagWithRelatedPersonsTransformed[] = [];

  aanvragen.forEach((aanvraag) => {
    group.push(aanvraag);

    if (aanvraag.datumEindeGeldigheid && isRTMDeel2(aanvraag)) {
      groupedAanvragen.push(group);
      group = [];
      return;
    }
  });

  const remainingToegewezenAanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[] =
    [];

  const aanvragenGroupedPerRegeling = [
    remainingToegewezenAanvragen,
    ...groupedAanvragen,
    group,
  ].filter((g) => g.length);
  return aanvragenGroupedPerRegeling;
}

/** Check if einde recht is reached, this assumes that the aanvraag is RTM-2 */
function isEindeRechtReached(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
): boolean {
  return !!(
    aanvraag.isActueel === false &&
    aanvraag.datumEindeGeldigheid &&
    isAfter(new Date(), aanvraag.datumEindeGeldigheid)
  );
}

type AanvraagType =
  | null
  | 'aanvraag-toegewezen'
  | 'aanvraag-afgewezen'
  | 'aanvraag-wijziging'
  | 'result-migratie'
  | 'result-toegewezen'
  | 'result-afgewezen'
  | 'result-einde-recht'
  | 'result-wijziging-toegewezen'
  | 'result-wijziging-afgewezen';

type AanvraagWithType = ZorgnedHLIRegeling & { type: AanvraagType };

function createAanvraagWithType(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed,
  isRegelingBesluitToegewezenState: boolean,
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[],
  idx: number
): AanvraagWithType {
  const withType = (type: AanvraagType) => {
    return {
      ...aanvraag,
      type,
    };
  };

  if (!aanvraag.resultaat) {
    return withType(null);
  }

  if (isEindeRechtReached(aanvraag)) {
    return withType('result-einde-recht');
  }

  if (!isRegelingBesluitToegewezenState) {
    if (isRTMDeel1(aanvraag)) {
      return withType(`aanvraag-${aanvraag.resultaat}`);
    }
    return withType(`result-${aanvraag.resultaat}`);
  }

  if (isRTMDeel1(aanvraag)) {
    return withType('aanvraag-wijziging');
  }

  const previousAanvraag = aanvragen[idx - 1];
  if (isRegelingBesluitToegewezenState && isRTMDeel1(previousAanvraag)) {
    return withType(`result-wijziging-${aanvraag.resultaat}`);
  }
  return withType(`result-${aanvraag.resultaat}`);
}

function mergeAanvragenIntoRegeling(
  aanvragen: AanvraagWithType[]
): ZorgnedHLIRegeling {
  const [head, ...aanvragenTail] = aanvragen;

  let isBesluitToegewezenState = false;

  const regeling = aanvragenTail.reduce(
    (regeling, aanvraag) => {
      // An Afgewezen wijziging changes nothing about the status of the active regeling.
      if (aanvraag.type === 'result-wijziging-afgewezen') {
        return {
          ...regeling,
          datumBesluit: aanvraag.datumBesluit,
        };
      }

      if (aanvraag.type === 'result-toegewezen') {
        isBesluitToegewezenState = true;
      }

      let isActueel = aanvraag.isActueel;

      if (isBesluitToegewezenState) {
        if (isRTMDeel2(aanvraag) && isEindeRechtReached(aanvraag)) {
          isActueel = false;
          isBesluitToegewezenState = false;
        } else {
          isActueel = true;
        }
      }

      return {
        ...aanvraag,
        isActueel,
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
  regeling: ZorgnedHLIRegeling,
  aanvragen: AanvraagWithType[]
): StatusLineItem[] {
  const incompleteStatusLineItems = aanvragen.reduce(
    (statusLineItems, aanvraag, i, aanvragen) => {
      return [
        ...statusLineItems,
        ...getStatusLineItems(aanvraag, aanvragen[i - 1]),
      ];
    },
    [] as IncompleteStatusLineItem[]
  );
  if (!incompleteStatusLineItems.length) {
    return [];
  }
  return finalizeStatusLineItems(
    regeling,
    incompleteStatusLineItems,
    aanvragen
  );
}

/** Determines active step and checks untill there (including), and adds ids */
function finalizeStatusLineItems(
  regeling: ZorgnedHLIRegeling,
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
  if (regeling.isActueel) {
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

function getInBehandelingGenomenDescription(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed,
  descriptionStart: string
): string {
  if (aanvraag.betrokkenen.length > 1) {
    descriptionStart += `<p><strong>Vraagt u de ${aanvraag.titel} (ook) voor andere gezinsleden aan?</strong><br/>De uitslag van de aanvraag is op Mijn Amsterdam te vinden met de DigiD login gegevens van uw gezinsleden.</p>
          <p>Nog geen DigiD login gegevens? <a rel="noopener noreferrer" href="https://www.digid.nl/aanvragen-en-activeren/digid-aanvragen">Ga naar DigiD aanvragen.</a></p>
          `;
    descriptionStart += `<p><strong>Gedeeltelijke afwijzing voor u of uw gezinsleden?</strong><br/>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>`;
  }

  return descriptionStart;
}

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
        const description = `<p>Voordat u de ${aanvraag.titel} krijgt, moet u een afspraak maken voor een medische keuring bij de GGD. In de brief staat hoe u dat doet.</p>`;
        return getInBehandelingGenomenDescription(aanvraag, description);
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
      description: (aanvraag) => {
        const description = `<p>U heeft een aanvraag gedaan voor aanpassing op uw lopende RTM regeling.</p>
<p>Hiervoor moet u een afspraak maken voor een medisch gesprek bij de GGD. In de brief staat hoe u dat doet.</p>`;
        return getInBehandelingGenomenDescription(aanvraag, description);
      },
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
      // These documents are put in 'besluit'.
      documents: () => [],
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

function getStatusLineItems(
  aanvraag: AanvraagWithType,
  previousAanvraag: AanvraagWithType | undefined
): IncompleteStatusLineItem[] {
  const getStatusLineItem = createGetStatusLineItemFn(aanvraag);
  switch (aanvraag.type) {
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
    case 'result-afgewezen': {
      return getStatusLineItem(['besluit']);
    }
    case 'result-einde-recht': {
      if (!previousAanvraag || previousAanvraag.type !== 'aanvraag-wijziging') {
        return getStatusLineItem(['besluit', 'eindeRecht']);
      }
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
    default: {
      captureMessage(
        `No statusstep found for aanvraag type: ${aanvraag.type}`,
        { severity: 'error' }
      );
      return [];
    }
  }
}
