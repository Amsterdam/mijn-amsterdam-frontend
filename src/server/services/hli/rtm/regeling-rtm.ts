import { addDays } from 'date-fns';
import { isAfter } from 'date-fns/isAfter';
import { parseISO } from 'date-fns/parseISO';
import { generatePath } from 'react-router';
import slug from 'slugme';

import { routeConfig } from '../../../../client/pages/Thema/HLI/HLI-thema-config';
import {
  type ApiResponse,
  apiSuccessResult,
} from '../../../../universal/helpers/api';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import { capitalizeFirstLetter } from '../../../../universal/helpers/text';
import { hash, sortAlpha } from '../../../../universal/helpers/utils';
import type { StatusLineItem } from '../../../../universal/types/App.types';
import type {
  AuthProfile,
  AuthProfileAndToken,
} from '../../../auth/auth-types';
import type {
  BSN,
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedPerson,
} from '../../zorgned/zorgned-types';
import { getDocumentsFrontend } from '../hli';
import type {
  HLIRegelingFrontend,
  HLIRegelingSpecificatieFrontend,
} from '../hli-regelingen-types';
import { fetchZorgnedAanvragenHLI } from '../hli-zorgned-service';
import { getBesluitDescription } from '../status-line-items/generic';

// Titel for RTM Specificatie documents in Zorgned
export const RTM_SPECIFICATIE_TITLE = 'AV-RTM Specificatie';

// Toets voorwaarden voor een afspraak GGD
export const AV_RTM_DEEL1 = 'AV-RTM1';
// Afhandeling afspraak GGD
export const AV_RTM_DEEL2 = 'AV-RTM';

type ZorgnedRTMAanvraag = ZorgnedAanvraagWithRelatedPersonsTransformed & {
  procesAanvragen?: ZorgnedRTMAanvraag[];
};

const INFO_LINK =
  'https://www.amsterdam.nl/werk-en-inkomen/regelingen-bij-laag-inkomen-pak-je-kans/regelingen-alfabet/extra-geld-als-u-chronisch-ziek-of/';

export function isRTMAanvraag(aanvraag: ZorgnedRTMAanvraag): boolean {
  return (
    !!aanvraag.productIdentificatie &&
    [AV_RTM_DEEL1, AV_RTM_DEEL2].includes(aanvraag.productIdentificatie)
  );
}

function isEindeRechtReached(aanvraag: ZorgnedRTMAanvraag): boolean {
  return !!(
    aanvraag.datumEindeGeldigheid &&
    isAfter(new Date(), aanvraag.datumEindeGeldigheid)
  );
}

function maybeWithAdditionalInfoForBetrokkenen(
  aanvraag: ZorgnedRTMAanvraag,
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

type LineItemConfig = {
  status: string;
  description: (aanvraag: ZorgnedRTMAanvraag) => string;
};
// Occasionally, aanvragen generate two statusLineItems, with the documents placed in only one of them.
const lineItemConfigs: Record<string, LineItemConfig> = {
  besluitAanvraagAfgewezen: {
    status: 'Besluit',
    description: () =>
      '<p>Uw aanvraag is afgewezen. Bekijk de brief voor meer informatie hierover.</p>',
  },
  aanvraag: { status: 'Aanvraag', description: () => '' },
  inBehandeling: {
    status: 'In behandeling genomen',
    description: (aanvraag) => {
      const description = `<p>Voordat u de ${aanvraag.titel} krijgt, moet u een afspraak maken voor een medische keuring bij de GGD. In de brief staat hoe u dat doet.</p>`;
      return maybeWithAdditionalInfoForBetrokkenen(aanvraag, description);
    },
  },
  besluit: { status: 'Besluit', description: getBesluitDescription },
  aanvraagWijziging: {
    status: 'Aanvraag wijziging',
    description: (aanvraag) => {
      const description = `<p>U heeft een aanvraag gedaan voor aanpassing op uw lopende RTM regeling.</p>
<p>Hiervoor moet u een afspraak maken voor een medisch gesprek bij de GGD. In de brief staat hoe u dat doet.</p>`;
      return maybeWithAdditionalInfoForBetrokkenen(aanvraag, description);
    },
  },
  besluitWijziging: {
    status: 'Besluit wijziging',
    description: () =>
      '<p>Uw aanvraag voor een wijziging is afgehandeld. Bekijk de brief voor meer informatie hierover.</p>',
  },
  eindeRecht: {
    status: 'Einde recht',
    description: (aanvraag) => {
      if (aanvraag.datumEindeGeldigheid) {
        const bezwaarDescription =
          '<p>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>';
        // The brief mentions the following if the Einde recht is on 30 november:
        // "Uw recht op RTM stopt per 1 december."
        const dateStr = defaultDateFormat(
          addDays(aanvraag.datumEindeGeldigheid, 1)
        );

        if (isEindeRechtReached(aanvraag)) {
          return `<p>Uw recht op ${aanvraag.titel} is beëindigd per ${dateStr}.</p>${bezwaarDescription}`;
        }

        return `<p>Uw recht op ${aanvraag.titel} stopt per ${dateStr}.</p>${bezwaarDescription}`;
      }
      return `
<p>U hoeft de ${aanvraag.titel} niet elk jaar opnieuw aan te vragen. De gemeente verlengt de regeling stilzwijgend, maar controleert wel elk jaar of u nog in aanmerking komt.</p>
<p>U kunt dan ook een brief krijgen met het verzoek om extra informatie te geven.</p>
<p><a href="${INFO_LINK}">Als er wijzigingen zijn in uw situatie moet u die direct doorgeven</a>.</p>`;
    },
  },
} as const;

function getStatusDate(
  status: StatusLineItem['status'],
  aanvraag: ZorgnedRTMAanvraag
): string {
  switch (status) {
    case lineItemConfigs.aanvraag.status:
    case lineItemConfigs.aanvraagWijziging.status:
    case lineItemConfigs.inBehandeling.status:
      return aanvraag.datumAanvraag;
    case lineItemConfigs.besluit.status:
    case lineItemConfigs.besluitAanvraagAfgewezen.status:
      return aanvraag.datumBesluit;
    case lineItemConfigs.eindeRecht.status:
      return aanvraag.datumEindeGeldigheid ?? '';
    default:
      return '';
  }
}

function createStatusLineItemStep(
  lineItemConfig: LineItemConfig,
  aanvraag: ZorgnedRTMAanvraag
): StatusLineItem {
  return {
    status: lineItemConfig.status,
    description: lineItemConfig.description(aanvraag),
    id: slug(`${lineItemConfig.status}-${aanvraag.prettyID}`),
    datePublished: getStatusDate(lineItemConfig.status, aanvraag),
    isActive: false,
    // We default to checked and determine which step can be unchecked later.
    isChecked: true,
    documents: aanvraag.documenten,
  };
}

export function mapAanvragenByBetrokkenen(
  bsnLoggedinUser: BSN,
  aanvraagSet: ZorgnedRTMAanvraag[]
) {
  const aanvragenByBetrokkenen = new Map<string, ZorgnedRTMAanvraag[]>([
    ['orphans', []],
    [bsnLoggedinUser, []],
  ]);
  const betrokkenenKeys = aanvraagSet
    .filter((a) => a.betrokkenen.length > 0)
    .map((a) => a.betrokkenen.sort().join(','));

  const hasSingleBetrokkene =
    new Set(aanvraagSet.flatMap((a) => a.betrokkenen)).size === 1;
  const hasOnlyAfgewezen = aanvraagSet.every(
    (a) => a.resultaat === 'afgewezen'
  );
  const hasNoBetrokkenen = aanvraagSet.every(
    (a) => a.resultaat === 'toegewezen' && a.betrokkenen.length === 0
  );
  const hasSamebetrokkenen = new Set(betrokkenenKeys).size === 1;

  if (
    hasSingleBetrokkene ||
    hasOnlyAfgewezen ||
    hasNoBetrokkenen ||
    hasSamebetrokkenen
  ) {
    let betrokkene: string | undefined;

    if (hasSingleBetrokkene) {
      betrokkene = aanvraagSet.find((a) => a.betrokkenen.length)
        ?.betrokkenen[0];
    } else if (hasSamebetrokkenen) {
      betrokkene = aanvraagSet[0].betrokkenen.join(',');
    }

    aanvragenByBetrokkenen.set(betrokkene ?? bsnLoggedinUser, aanvraagSet);
  } else {
    for (const aanvraag of aanvraagSet) {
      // If afgewezen and fase 1, we cannot know the betrokkene(n), so we add it to orphans.
      // Orphans will be assigned a separate statustrein later.
      if (
        aanvraag.resultaat === 'afgewezen' &&
        aanvraag.productIdentificatie === AV_RTM_DEEL1
      ) {
        aanvragenByBetrokkenen.get('orphans')?.push(aanvraag);
      } else {
        for (const betrokkene of aanvraag.betrokkenen) {
          if (!aanvragenByBetrokkenen.has(betrokkene)) {
            aanvragenByBetrokkenen.set(betrokkene, []);
          }
          aanvragenByBetrokkenen.get(betrokkene)?.push(aanvraag);
        }
      }
    }
  }

  return aanvragenByBetrokkenen;
}

// The betrokkenenMapStr is a string like "bsn1,bsn2,bsn3" for regular sets. Or "bsn5,bsn6-0" / "bsn5,bsn6-1" for split sets.
function getBetrokkenenBSNs(betrokkenenMapStr: string) {
  return betrokkenenMapStr.split(',').map((b) => b.split('-')[0]);
}

export function splitAanvragenByBetrokkenenAtDatumGeldigheid(
  aanvragenByBetrokkenen: Map<string, ZorgnedRTMAanvraag[]>
) {
  for (const [betrokkene, aanvragen] of aanvragenByBetrokkenen.entries()) {
    let splitIndex = 0;
    let betrokkenenMapStr = betrokkene;

    aanvragenByBetrokkenen.set(betrokkenenMapStr, []);

    for (const aanvraag of aanvragen) {
      aanvragenByBetrokkenen.get(betrokkenenMapStr)?.push(aanvraag);

      if (
        aanvraag.datumEindeGeldigheid &&
        aanvraag.productIdentificatie === AV_RTM_DEEL2
      ) {
        betrokkenenMapStr = `${betrokkene}-${++splitIndex}`;
        aanvragenByBetrokkenen.set(betrokkenenMapStr, []);
      }
    }
  }

  return aanvragenByBetrokkenen;
}

function getSteps(
  sessionID: AuthProfile['sid'],
  aanvragen: ZorgnedRTMAanvraag[]
) {
  const steps = aanvragen.flatMap((aanvraag, index, aanvragen) => {
    // Searches for items that came before the current aanvraag and checks if it's RTM FASE 2.
    const previousRTM2 = aanvragen
      .slice(0, index)
      .find((prevA) => prevA.productIdentificatie === AV_RTM_DEEL2);

    // ============================
    // Steps for RTM FASE 2.
    // ============================
    if (aanvraag.productIdentificatie === AV_RTM_DEEL2) {
      const besluitStatus =
        previousRTM2?.resultaat === 'toegewezen'
          ? lineItemConfigs.besluitWijziging
          : lineItemConfigs.besluit;
      // Wijzigingen en Einde recht worden mbh een proces toegepast op de bestaande RTM2 regeling.
      // Hierdoor komen er dus meerdere aanvragen met dezelfde beschiktProductIdentificatie door.
      // In het geval van de RTM2 regeling, maken we dus meerdere stappen aan voor dezelfde regeling obv de verschillende processen i.r.t de RTM2 regeling.
      const RTM2ProcesSteps = aanvraag.procesAanvragen?.length
        ? aanvraag.procesAanvragen.map((procesAanvraag) => {
            const lineItemConfig =
              procesAanvraag.procesAanvraagOmschrijving?.endsWith(
                'Beëindigen RTM'
              )
                ? lineItemConfigs.eindeRecht
                : lineItemConfigs.besluitWijziging;

            return createStatusLineItemStep(lineItemConfig, procesAanvraag);
          })
        : [];
      return [
        createStatusLineItemStep(besluitStatus, aanvraag),
        ...RTM2ProcesSteps,
      ];
    }

    // ============================
    // Steps for RTM FASE 1.
    // ============================

    if (aanvraag.resultaat === 'afgewezen') {
      return createStatusLineItemStep(
        previousRTM2?.resultaat === 'toegewezen'
          ? lineItemConfigs.besluitWijziging
          : lineItemConfigs.besluitAanvraagAfgewezen,
        aanvraag
      );
    }

    // There must be a toegewezen RTM FASE 2 before this aanvraag for this to be a "Aanvraag wijziging".
    const aanvraagStatus =
      previousRTM2?.resultaat === 'toegewezen'
        ? lineItemConfigs.aanvraagWijziging
        : lineItemConfigs.aanvraag;
    const aanvraagStep = createStatusLineItemStep(aanvraagStatus, aanvraag);

    const aanvraagSteps =
      aanvraagStatus === lineItemConfigs.aanvraag
        ? [
            // If we show an In Behandeling step, we don't show documents on the Aanvraag step.
            { ...aanvraagStep, documents: [] },
            createStatusLineItemStep(lineItemConfigs.inBehandeling, aanvraag),
          ]
        : [aanvraagStep];

    return aanvraagSteps;
  });

  const mostRecentToegewezenRTM = aanvragen.findLast(
    (a) =>
      a.productIdentificatie === AV_RTM_DEEL2 && a.resultaat === 'toegewezen'
  );

  // Check if there is an einde recht step (by a beëindigingsproces) already present.
  let eindeRechtStep: StatusLineItem | null =
    steps.findLast(
      (step) => step.status === lineItemConfigs.eindeRecht.status
    ) ?? null;
  // If we don't have an einde recht step yet, but there is a most recent toegewezen RTM regeling,
  // we create the "inactive" einde recht step.
  if (mostRecentToegewezenRTM && !eindeRechtStep) {
    eindeRechtStep = createStatusLineItemStep(
      lineItemConfigs.eindeRecht,
      mostRecentToegewezenRTM
    );
    steps.push(eindeRechtStep);
  }

  const LAST_STEP_INDEX = -1;
  const lastStep = steps.at(LAST_STEP_INDEX);

  const SECOND_TO_LAST_STEP_INDEX = -2;
  const secondToLastStep = steps.at(SECOND_TO_LAST_STEP_INDEX);

  const isEindeRechtReached = eindeRechtStep
    ? new Date() > parseISO(eindeRechtStep.datePublished)
    : false;

  if (eindeRechtStep) {
    // If einde recht is not reached, the second to last step is active.
    if (secondToLastStep) {
      secondToLastStep.isActive = !isEindeRechtReached;
    }

    // Einde recht step always is checked and active.
    eindeRechtStep.isChecked = eindeRechtStep.isActive = isEindeRechtReached;
  } else if (!eindeRechtStep && lastStep) {
    // If there is no einde recht step, the last step is always active.
    lastStep.isActive = true;
  }

  const stepsWithDocumentUrls = steps.map((step) => {
    return {
      ...step,
      documents: getDocumentsFrontend(sessionID, step.documents ?? []),
    };
  });

  return stepsWithDocumentUrls;
}

function getBetrokkenen(
  betrokkenenMapStr: string,
  aanvragen: ZorgnedRTMAanvraag[]
): string {
  const betrokkenenBSNs = getBetrokkenenBSNs(betrokkenenMapStr);
  // Filter unique persons by BSN.
  const betrokkenPersonenFlattened = aanvragen.flatMap(
    (a) => a.betrokkenPersonen
  );
  const betrokkenen = betrokkenenBSNs
    .map((bsn) => {
      const betrokkene = betrokkenPersonenFlattened.find((p) => p.bsn === bsn);
      return betrokkene?.name;
    })
    .filter(Boolean)
    .join(', ');
  return betrokkenen;
}

function transformRTMRegelingenFrontend(
  sessionID: AuthProfile['sid'],
  aanvragenByBetrokkenen: Map<string, ZorgnedRTMAanvraag[]>
) {
  const regelingen: HLIRegelingFrontend[] = [];

  for (const [
    betrokkenenMapStr,
    aanvragen,
  ] of aanvragenByBetrokkenen.entries()) {
    const steps = getSteps(sessionID, aanvragen);

    if (!steps.length) {
      continue;
    }

    const mostRecentAanvraag = aanvragen.at(-1)!;

    // We reverse because the most recent aanvraag should be first in the hash.
    const id = hash(
      aanvragen
        .map((a) => a.prettyID)
        .toReversed()
        .join()
    );
    const title = mostRecentAanvraag.titel;
    const betrokkenen = getBetrokkenen(betrokkenenMapStr, aanvragen);

    const route = generatePath(routeConfig.detailPage.path, {
      id,
      regeling: slug(title),
    });
    // Get dates for the HLIRegeling from the steps.
    const RTM2Aanvragen = aanvragen.filter(
      (a) => a.productIdentificatie === AV_RTM_DEEL2
    );
    const toegewezenRTM2 = RTM2Aanvragen.find(
      (a) => a.resultaat === 'toegewezen'
    );
    const hasToegewezenRTM2 = !!toegewezenRTM2;
    const lastRTM2 = RTM2Aanvragen.at(-1);
    const dateDecision =
      lastRTM2?.datumBesluit ?? mostRecentAanvraag.datumBesluit ?? '';
    const dateRequest = mostRecentAanvraag.datumAanvraag ?? '';
    // We assume that datumEindeGeldigheid is always set for the latest RTM-2 aanvraag.
    const dateEnd = lastRTM2?.datumEindeGeldigheid ?? '';
    const dateStart = RTM2Aanvragen?.[0]?.datumBesluit ?? '';

    // Determine if the regeling is actual. This is needed to show the regeling as lopend or huidig.
    let isActual = false;

    // An active RTM is present
    if (
      // Any valid RTM2 means the regeling is actual
      (hasToegewezenRTM2 && !isEindeRechtReached(toegewezenRTM2)) ||
      (aanvragen.every((a) => a.resultaat === 'toegewezen') &&
        !isEindeRechtReached(mostRecentAanvraag))
    ) {
      isActual = true;
    }

    let displayStatus =
      steps.findLast((step) => step.isActive)?.status ?? 'Onbekend';

    if (displayStatus === 'Besluit' && !hasToegewezenRTM2) {
      displayStatus = capitalizeFirstLetter(mostRecentAanvraag.resultaat);
    }

    const RTMRegeling: HLIRegelingFrontend = {
      id,
      steps,
      dateRequest,
      dateDecision,
      dateEnd,
      dateStart,
      documents: [],
      isActual,
      // Decision cannot be reliably determined because there might be both toegewezen and afgewezen aanvragen for different betrokkenen.
      decision:
        aanvragen.every((a) => a.resultaat === 'toegewezen') ||
        hasToegewezenRTM2
          ? 'toegewezen'
          : 'afgewezen',
      betrokkenen,
      title,
      link: {
        title: 'Meer informatie',
        to: route,
      },
      displayStatus,
    };
    regelingen.push(RTMRegeling);
  }

  return regelingen;
}

/* Only keep PDF documents in the aanvragen
 *
 * Mistakes happen, and sometimes the wrong type of document is uploaded in Zorgned.
 * A concern with this is that a docx file (MS Word) is more easily edited.
 * Which is speculated to cause people to try their luck more with fraudulant documents.
 */
function removeNonPdfDocuments(
  aanvragen: ZorgnedRTMAanvraag[]
): ZorgnedRTMAanvraag[] {
  return aanvragen.map((aanvraag) => ({
    ...aanvraag,
    documenten: aanvraag.documenten.filter(
      // We assume documents without filename are PDFs.
      (doc) => !doc.filename || doc.filename.endsWith('pdf')
    ),
  }));
}

function removeSpecificatieDocuments(
  aanvragen: ZorgnedRTMAanvraag[]
): ZorgnedRTMAanvraag[] {
  return aanvragen.map((aanvraag) => ({
    ...aanvraag,
    documenten: aanvraag.documenten.filter(
      (doc) => doc.title !== RTM_SPECIFICATIE_TITLE
    ),
  }));
}

// Checks if there are multiple aanvragen with the same beschiktProductIdentificatie
// and adds all subsequent aanvragen as procesAanvragen to the first aanvraag.
function collectProcesAanvragen(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
): ZorgnedRTMAanvraag[] {
  const seenAanvragen = new Map<string, ZorgnedRTMAanvraag>();

  for (const aanvraag of aanvragen) {
    const id = aanvraag.beschiktProductIdentificatie;
    if (seenAanvragen.has(id)) {
      const existingAanvraag = seenAanvragen.get(id)!;
      seenAanvragen.set(id, {
        ...existingAanvraag,
        procesAanvragen: [
          ...(existingAanvraag.procesAanvragen ?? []),
          aanvraag,
        ],
      });
    } else {
      seenAanvragen.set(id, aanvraag);
    }
  }

  return Array.from(seenAanvragen.values());
}

// The RTM2 aanvraag is only present for the logged-in user so we know for sure they are a betrokkene.
function addAanvragerToRTM2Aanvragen(
  aanvragen: ZorgnedRTMAanvraag[],
  aanvrager: ZorgnedPerson | Pick<ZorgnedPerson, 'bsn'>
) {
  return aanvragen.map((aanvraag) => {
    if (
      aanvraag.productIdentificatie === AV_RTM_DEEL2 &&
      aanvraag.resultaat === 'afgewezen' &&
      !aanvraag.betrokkenen.includes(aanvrager.bsn)
    ) {
      return {
        ...aanvraag,
        betrokkenen: [aanvrager.bsn, ...aanvraag.betrokkenen],
        betrokkenPersonen: [
          { name: `Met bsn: ${aanvrager.bsn}`, ...aanvrager } as ZorgnedPerson,
          ...aanvraag.betrokkenPersonen,
        ],
      };
    }
    return aanvraag;
  });
}

// Aanvragen are processed in chronological order (ASC), so the order of the aanvragen from Zorgned matter.
export function transformRTMAanvragen(
  sessionID: AuthProfile['sid'],
  aanvrager: ZorgnedPerson | Pick<ZorgnedPerson, 'bsn'>,
  RTMaanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
) {
  const aanvragenSorted = RTMaanvragen.toSorted(sortAlpha('id', 'asc'));
  const aanvragenDeduped = collectProcesAanvragen(aanvragenSorted);

  const aanvragenWithPdfDocumentsOnly = removeNonPdfDocuments(aanvragenDeduped);
  const aanvragenWithoutSpecificaties = removeSpecificatieDocuments(
    aanvragenWithPdfDocumentsOnly
  );
  const aanvragenWithAddedAanvrager = addAanvragerToRTM2Aanvragen(
    aanvragenWithoutSpecificaties,
    aanvrager
  );
  // RTM aanvragen are processed in chronological order (ASC), so we sort them first.
  const aanvragenByBetrokkenen = mapAanvragenByBetrokkenen(
    aanvrager.bsn,
    aanvragenWithAddedAanvrager
  );

  const aanvragenByBetrokkenenSplitted =
    splitAanvragenByBetrokkenenAtDatumGeldigheid(aanvragenByBetrokkenen);

  return transformRTMRegelingenFrontend(
    sessionID,
    aanvragenByBetrokkenenSplitted
  );
}

export async function fetchRTMSpecificaties(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<HLIRegelingSpecificatieFrontend[]>> {
  const response = await fetchZorgnedAanvragenHLI(
    authProfileAndToken.profile.id
  );
  if (response.status !== 'OK') {
    return response;
  }

  const specificaties: HLIRegelingSpecificatieFrontend[] =
    response.content.flatMap((aanvraag) => {
      const specificaties = getDocumentsFrontend(
        authProfileAndToken.profile.sid,
        aanvraag.documenten
      )
        .filter((doc) => doc.title === RTM_SPECIFICATIE_TITLE)
        .map((doc) => {
          const specificatie: HLIRegelingSpecificatieFrontend = {
            ...doc,
            category: aanvraag.titel,
            datePublishedFormatted: defaultDateFormat(doc.datePublished),
          };
          return specificatie;
        });
      return specificaties;
    });

  return apiSuccessResult(specificaties);
}

export const forTesting = {
  dedupeButKeepDocuments: collectProcesAanvragen,
  removeNonPdfDocuments,
  getSteps,
  mapAanvragenByBetrokkenen,
  splitAanvragenByBetrokkenenAtDatumGeldigheid,
  getBetrokkenenBSNs,
};
