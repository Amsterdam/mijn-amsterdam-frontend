import { isAfter } from 'date-fns';
import { generatePath } from 'react-router';
import slug from 'slugme';

import { getBesluitDescription } from './generic';
import { featureToggle } from '../../../../client/pages/Thema/HLI/HLI-thema-config';
import { routeConfig } from '../../../../client/pages/Thema/HLI/HLI-thema-config';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import { capitalizeFirstLetter } from '../../../../universal/helpers/text';
import { sortAlpha } from '../../../../universal/helpers/utils';
import {
  GenericDocument,
  StatusLineItem,
} from '../../../../universal/types/App.types';
import { AuthProfileAndToken } from '../../../auth/auth-types';
import { parseLabelContent } from '../../zorgned/zorgned-helpers';
import {
  BeschikkingsResultaat,
  TextPartContents,
  ZorgnedAanvraagWithRelatedPersonsTransformed,
} from '../../zorgned/zorgned-types';
import {
  GenericDisplayStatus,
  getDisplayStatus,
  GetDisplayStatusFn,
  getDocumentsFrontend,
} from '../hli';
import type {
  HLIRegelingFrontend,
  ZorgnedHLIRegeling,
} from '../hli-regelingen-types';

// Toets voorwaarden voor een afspraak GGD
export const AV_RTM_DEEL1 = 'AV-RTM1';
// Afhandeling afspraak GGD
export const AV_RTM_DEEL2 = 'AV-RTM';

export const RTM_STATUS_IN_BEHANDELING = 'In behandeling genomen';
export const RTM_STATUS_EINDE_RECHT = 'Einde recht';

const INFO_LINK =
  'https://www.amsterdam.nl/werk-en-inkomen/regelingen-bij-laag-inkomen-pak-je-kans/regelingen-alfabet/extra-geld-als-u-chronisch-ziek-of/';

export function isRTMAanvraag(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  return isRTMDeel1(aanvraag) || isRTMDeel2(aanvraag);
}

function isRTMDeel1(aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed) {
  return (
    !!aanvraag.productIdentificatie &&
    AV_RTM_DEEL1 === aanvraag.productIdentificatie
  );
}

function isRTMDeel2(aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed) {
  return (
    !!aanvraag.productIdentificatie &&
    AV_RTM_DEEL2 === aanvraag.productIdentificatie
  );
}

function isAfgewezenRTM2(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
) {
  return isRTMDeel2(aanvraag) && aanvraag.resultaat === 'afgewezen';
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

export const getRTMDisplayStatus: GetDisplayStatusFn<
  GenericDisplayStatus | typeof RTM_STATUS_IN_BEHANDELING
> = (regeling: ZorgnedHLIRegeling, statusLineItems: StatusLineItem[]) => {
  const isInBehandelingGenomen = statusLineItems.some((item) => {
    return item.status === RTM_STATUS_IN_BEHANDELING && item.isActive;
  });
  if (isInBehandelingGenomen) {
    return RTM_STATUS_IN_BEHANDELING;
  }
  return getDisplayStatus(regeling, statusLineItems);
};

export function filterCombineRtmData(
  authProfileAndToken: AuthProfileAndToken,
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
): HLIRegelingFrontend[] {
  if (!featureToggle.hliRegelingEnabledRTM) {
    return [];
  }

  let aanvragenClean = dedupeButKeepDocuments(aanvragen);
  aanvragenClean = removeNonPdfDocuments(aanvragenClean);
  // Sort asc so we always end with an 'Einde recht'.
  // This keeps it in the same order as how we describe the scenarios, so you don't need to think in reverse.
  aanvragenClean.sort(sortAlpha('id', 'asc'));

  // Prevent aanvragen from other 'betrokkenen' sets from being mixed up with eachother.
  let aanvragenPerBetrokkenen = mapAanvragenPerBetrokkenen(
    aanvragenClean,
    authProfileAndToken.profile.id
  );
  aanvragenPerBetrokkenen = removeExpiredIndividualAanvragen(
    aanvragenPerBetrokkenen
  );

  const groupedAanvragenPerRegeling = Object.entries(
    aanvragenPerBetrokkenen
  ).flatMap(([, aanvragen]) => {
    return groupAanvragenPerRegeling(aanvragen);
  });

  const regelingenFrontend = processRTMAanvragen(
    groupedAanvragenPerRegeling,
    authProfileAndToken
  );
  return regelingenFrontend;
}

/** Aanvragen can contain duplicate RTMDeel2. We combine the documents and drop the dupe. */
function dedupeButKeepDocuments(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
) {
  const dedupedAanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[] = [];
  const seenAanvragen: Record<string, ZorgnedHLIRegeling> = {};

  for (const aanvraag of aanvragen) {
    if (isRTMDeel1(aanvraag)) {
      // I did not find any RTM-1 duplicate, the problem was only seen with RTM-2.
      dedupedAanvragen.push(aanvraag);
      continue;
    }
    const id = aanvraag.beschiktProductIdentificatie;
    if (seenAanvragen[id]) {
      seenAanvragen[id].documenten = [
        ...seenAanvragen[id].documenten,
        ...aanvraag.documenten,
      ];
      continue;
    }
    seenAanvragen[id] = aanvraag;
    dedupedAanvragen.push(aanvraag);
  }
  return dedupedAanvragen;
}

/* Only keep PDF documents in the aanvragen
 *
 * Mistakes happen, and sometimes the wrong type of document is uploaded in Zorgned.
 * A concern with this is that a docx file (MS Word) is more easily edited.
 * Which is speculated to cause people to try their luck more with fraudulant documents.
 */
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
  /* Orphaned aanvragen are aanvragen where we don't know to who it belongs. */
  orphaned: ZorgnedAanvraagWithRelatedPersonsTransformed[];
};

function mapAanvragenPerBetrokkenen(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[],
  bsnLoggedInPerson: string
): AanvragenPerBetrokkene {
  aanvragen = aanvragen.map((aanvraag) => {
    return {
      ...aanvraag,
      // Sort because I don't know if betrokkenen are always in the same order across different aanvragen.
      betrokkenen: aanvraag.betrokkenen.toSorted(),
    };
  });

  const foundBetrokkenenSets = aanvragen
    .filter((a) => a.betrokkenen.length > 0)
    .map((a) => a.betrokkenen.join(','));

  const hasAllAanvragenIdenticalBetrokkene =
    new Set(foundBetrokkenenSets).size === 1;

  if (hasAllAanvragenIdenticalBetrokkene) {
    return {
      [foundBetrokkenenSets.join('-')]: aanvragen,
      orphaned: [],
    };
  }

  const aanvragenMap: AanvragenPerBetrokkene = {
    [bsnLoggedInPerson]: [],
    orphaned: [],
  };

  for (const aanvraag of aanvragen) {
    const betrokkenen = aanvraag.betrokkenen;
    if (!betrokkenen.length) {
      if (isRTMDeel2(aanvraag)) {
        aanvragenMap[bsnLoggedInPerson].push(aanvraag);
      } else {
        aanvragenMap.orphaned.push(aanvraag);
      }
    } else {
      // Copy/distribute aanvragen for every individual betrokkene.
      for (const bsn of betrokkenen) {
        if (bsn === bsnLoggedInPerson) {
          aanvragenMap[bsnLoggedInPerson].push(aanvraag);
        } else {
          const newAanvraag = {
            ...aanvraag,
            betrokkenen: [bsn],
            betrokkenPersonen: aanvraag.betrokkenPersonen.filter(
              (p) => p.bsn === bsn
            ),
          };
          if (aanvragenMap[bsn]) {
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

function processRTMAanvragen(
  groupedAanvragenPerRegeling: ZorgnedAanvraagWithRelatedPersonsTransformed[][],
  authProfileAndToken: AuthProfileAndToken
): HLIRegelingFrontend[] {
  const regelingen = Object.values(groupedAanvragenPerRegeling).reduce(
    (regelingen, aanvragen, i) => {
      // This can be used to determine if we are in a toegewezen RTM regeling context.
      // Which is usefull if you want to differentiate between RTM-1 Aanvragen and RTM-1 Wijzigings aanvragen,
      // or RTM-2 Besluiten and RTM-2 Wijzigings besluiten.
      const firstToegewezenRTMIdx = aanvragen.findIndex((aanvraag) => {
        return isRTMDeel2(aanvraag) && aanvraag.resultaat === 'toegewezen';
      });

      const statusLineItems = getAllStatusLineItems(
        groupedAanvragenPerRegeling[i],
        firstToegewezenRTMIdx
      ).map((statusLineItem) => {
        return {
          ...statusLineItem,
          documents:
            statusLineItem.documents &&
            getDocumentsFrontend(
              authProfileAndToken.profile.sid,
              statusLineItem.documents
            ),
        };
      });

      const regeling = createHLIRegelingFrontend(
        aanvragen,
        statusLineItems,
        firstToegewezenRTMIdx
      );

      regelingen.push(regeling);
      return regelingen;
    },
    [] as HLIRegelingFrontend[]
  );
  return regelingen;
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

  const aanvragenGroupedPerRegeling = [...groupedAanvragen, group].filter(
    (g) => g.length
  );
  return aanvragenGroupedPerRegeling;
}

function createHLIRegelingFrontend(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[],
  statusLineItems: StatusLineItem[],
  firstToegewezenRTM2Idx: number
): HLIRegelingFrontend {
  const lastAanvraag = aanvragen[aanvragen.length - 1];
  const toegewezenRTM2 = aanvragen.find(
    (a) => isRTMDeel2(a) && a.resultaat === 'toegewezen'
  );
  const lastRTM2 = aanvragen.findLast((a) => isRTMDeel2(a));
  const eindeRecht = aanvragen.find(
    (a) =>
      isRTMDeel2(a) && a.resultaat === 'toegewezen' && a.isActueel === false
  );

  const id = lastAanvraag.id;

  const isToegewezenRTM2Found = firstToegewezenRTM2Idx !== -1;

  const [decision, isActual] = aanvragen.reduce(
    ([decisionState, isActualState], aanvraag, i) => {
      const afterFirstToegewezenRTM =
        isToegewezenRTM2Found && i > firstToegewezenRTM2Idx;
      const isAfgewezenWijzigingsBesluit =
        afterFirstToegewezenRTM && isAfgewezenRTM2(aanvraag);

      // An afgwezen wijziging besluit results in no change to an active regeling.
      if (isAfgewezenWijzigingsBesluit) {
        return [decisionState, isActualState];
      }
      return [aanvraag.resultaat, aanvraag.isActueel];
    },
    ['afgewezen', false] as [BeschikkingsResultaat, boolean]
  );

  const displayStatus = getRTMDisplayStatus(
    isToegewezenRTM2Found && isAfgewezenRTM2(lastAanvraag)
      ? // We know aanvragen.length > 2 because, an AfgewezenWijzigingsBesluit is always after an aanvraag for a wijziging,
        // and must be in a toegewezen regeling context.
        aanvragen[aanvragen.length - 2]
      : lastAanvraag,
    statusLineItems
  );

  const regelingFrontend: HLIRegelingFrontend = {
    id,
    title: capitalizeFirstLetter(lastAanvraag.titel),
    isActual,
    link: {
      title: 'Meer informatie',
      to: generatePath(routeConfig.detailPage.path, {
        id,
        regeling: slug(lastAanvraag.titel),
      }),
    },
    steps: statusLineItems,
    dateDecision:
      lastRTM2?.datumBesluit ??
      aanvragen.findLast((a) => a.datumBesluit)?.datumBesluit ??
      '',
    dateStart: toegewezenRTM2?.datumIngangGeldigheid ?? null,
    dateEnd: eindeRecht?.datumEindeGeldigheid ?? null,
    decision,
    displayStatus,
    documents: aanvragen.flatMap((a) => a.documenten),
    betrokkenen: lastAanvraag.betrokkenPersonen.length
      ? lastAanvraag.betrokkenPersonen.map((persoon) => persoon.name).join(', ')
      : '-',
  };

  return regelingFrontend;
}

function getAllStatusLineItems(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[],
  firstToegewezenRTM2Idx: number
): StatusLineItem[] {
  let isInToegewezenState = false;
  const isToegewezenRTMFound = firstToegewezenRTM2Idx !== -1;

  const incompleteStatusLineItems = aanvragen.reduce(
    (statusLineItems, aanvraag, i) => {
      if (isToegewezenRTMFound && i > firstToegewezenRTM2Idx) {
        isInToegewezenState = true;
      }
      statusLineItems.push(
        ...getStatusLineItems(aanvraag, isInToegewezenState)
      );
      return statusLineItems;
    },
    [] as IncompleteStatusLineItem[]
  );

  const lastAanvraag = aanvragen[aanvragen.length - 1];

  const getStatusLineItem = createGetStatusLineItemFn(lastAanvraag);
  if (isRTMDeel2(lastAanvraag) && isEindeRechtReached(lastAanvraag)) {
    incompleteStatusLineItems.push(
      ...getStatusLineItem([statusLineItems.eindeRecht])
    );
  } else if (
    lastAanvraag.resultaat !== 'afgewezen' ||
    (isInToegewezenState && lastAanvraag.resultaat === 'afgewezen')
  ) {
    incompleteStatusLineItems.push(
      ...getStatusLineItem([statusLineItems.inactiveEindeRecht])
    );
  }

  const eindeRechtLineItem = incompleteStatusLineItems.find(
    (item) => item.status === RTM_STATUS_EINDE_RECHT
  );

  const lastStatusLineItem =
    incompleteStatusLineItems[incompleteStatusLineItems.length - 1];

  if (eindeRechtLineItem && !eindeRechtLineItem.isActive) {
    // An eindeRechtLineItem is always at the end of the statusLineItems.
    // That's why we check the one before it.
    incompleteStatusLineItems[incompleteStatusLineItems.length - 2].isActive =
      true;
  } else {
    lastStatusLineItem.isActive = true;
  }
  // Either the last item is active or the one before it so the the last statusLineItem can never be checked.
  lastStatusLineItem.isChecked = false;

  const statusLineItemsComplete: StatusLineItem[] =
    incompleteStatusLineItems.map((item, i) => {
      return {
        ...item,
        id: `status-step-${i + 1}`,
        isActive: item.isActive ?? false,
      };
    });

  return statusLineItemsComplete;
}

function getStatusLineItems(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed,
  isInToegewezenState: boolean
): IncompleteStatusLineItem[] {
  const getStatusLineItem = createGetStatusLineItemFn(aanvraag);
  if (isInToegewezenState) {
    if (isRTMDeel1(aanvraag)) {
      return getStatusLineItem([statusLineItems.wijzigingsAanvraag]);
    }
    return getStatusLineItem([statusLineItems.wijzigingsBesluit]);
  }

  if (isRTMDeel1(aanvraag)) {
    if (aanvraag.resultaat === 'toegewezen') {
      return getStatusLineItem([
        statusLineItems.aanvraagLopend,
        statusLineItems.inBehandelingGenomen,
      ]);
    }
    return getStatusLineItem([statusLineItems.aanvraagAfgewezen]);
  }
  return getStatusLineItem([statusLineItems.besluit]);
}

type IncompleteStatusLineItem = Omit<StatusLineItem, 'id' | 'isActive'> & {
  isActive: boolean | null;
};

type getStatusLineItemFn = (
  itemChoices: StatusLineItemTransformerConfig[]
) => IncompleteStatusLineItem[];

function createGetStatusLineItemFn(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
): getStatusLineItemFn {
  return (transformerConfigs) => {
    const collectedStatusLineItems: IncompleteStatusLineItem[] = [];

    for (const transformerConfig of transformerConfigs) {
      const now = new Date();

      let documents: GenericDocument[] = [];
      if (typeof transformerConfig.documents === 'function') {
        documents = transformerConfig.documents(aanvraag);
        aanvraag.documenten = aanvraag.documenten.filter(
          (doc) => !documents.includes(doc)
        );
      }

      const statusLineItem: IncompleteStatusLineItem = {
        status: transformerConfig.status,
        description: parseLabelContent<ZorgnedHLIRegeling>(
          transformerConfig.description,
          aanvraag,
          now,
          []
        ),
        datePublished: parseLabelContent<ZorgnedHLIRegeling>(
          transformerConfig.datePublished,
          aanvraag,
          now,
          []
        ) as string,
        documents,
        isActive: transformerConfig.isActive
          ? transformerConfig.isActive(aanvraag)
          : null,
        isChecked: true,
        isVisible: true,
      };

      collectedStatusLineItems.push(statusLineItem);
    }

    return collectedStatusLineItems;
  };
}

const getDatumAfgifte = (regeling: ZorgnedHLIRegeling) =>
  regeling.datumInBehandeling || regeling.datumBesluit;

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

// Occasionally, aanvragen generate two statusLineItems, with the documents placed in only one of them.
const statusLineItems = {
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
    status: RTM_STATUS_IN_BEHANDELING,
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
    status: RTM_STATUS_EINDE_RECHT,
    datePublished: (aanvraag) => aanvraag.datumEindeGeldigheid || '',
    description: (aanvraag) => {
      return `<p>Uw recht op ${aanvraag.titel} is beëindigd per ${defaultDateFormat(aanvraag.datumEindeGeldigheid || '')}.</p><p>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>`;
    },
    // These documents are put in 'besluit'.
    documents: () => [],
    isActive: () => true,
  },
  inactiveEindeRecht: {
    status: RTM_STATUS_EINDE_RECHT,
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
} satisfies Record<string, StatusLineItemTransformerConfig>;
