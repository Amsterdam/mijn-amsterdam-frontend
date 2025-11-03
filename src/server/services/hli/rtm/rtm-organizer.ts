import { isAfter } from 'date-fns/isAfter';
import { parseISO } from 'date-fns/parseISO';
import { generatePath } from 'react-router';
import slug from 'slugme';

import { routeConfig } from '../../../../client/pages/Thema/HLI/HLI-thema-config';
import { defaultDateFormat } from '../../../../universal/helpers/date';
import { sortAlpha } from '../../../../universal/helpers/utils';
import type { StatusLineItem } from '../../../../universal/types/App.types';
import type {
  BSN,
  ZorgnedAanvraagWithRelatedPersonsTransformed,
} from '../../zorgned/zorgned-types';
import type { HLIRegelingFrontend } from '../hli-regelingen-types';
import { getBesluitDescription } from '../status-line-items/generic';

// Toets voorwaarden voor een afspraak GGD
export const AV_RTM_DEEL1 = 'AV-RTM1';
// Afhandeling afspraak GGD
export const AV_RTM_DEEL2 = 'AV-RTM';

const REGELING_TITLE_DEFAULT_PLACEHOLDER = 'Regeling tegemoetkoming meerkosten';

const INFO_LINK =
  'https://www.amsterdam.nl/werk-en-inkomen/regelingen-bij-laag-inkomen-pak-je-kans/regelingen-alfabet/extra-geld-als-u-chronisch-ziek-of/';

export type RTMaanvraagTransformed = {
  steps: StatusLineItem[];
  persoon: string | number;
  id: number;
};

export function isRTMAanvraag(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
): boolean {
  return (
    !!aanvraag.productIdentificatie &&
    [AV_RTM_DEEL1, AV_RTM_DEEL2].includes(aanvraag.productIdentificatie)
  );
}

function isEindeRechtReached(
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
): boolean {
  return !!(
    aanvraag.datumEindeGeldigheid &&
    isAfter(new Date(), aanvraag.datumEindeGeldigheid)
  );
}

function maybeWithAdditionalInfoForBetrokkenen(
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

// Occasionally, aanvragen generate two statusLineItems, with the documents placed in only one of them.
const lineItemConfig: Record<
  string,
  {
    status: string;
    description: (
      aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
    ) => string;
  }
> = {
  besluit: { status: 'Besluit', description: getBesluitDescription },
  aanvraag: { status: 'Aanvraag', description: () => '' },
  inBehandeling: {
    status: 'In behandeling genomen',
    description: (aanvraag) => {
      const description = `<p>Voordat u de ${aanvraag.titel} krijgt, moet u een afspraak maken voor een medische keuring bij de GGD. In de brief staat hoe u dat doet.</p>`;
      return maybeWithAdditionalInfoForBetrokkenen(aanvraag, description);
    },
  },
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
      if (isEindeRechtReached(aanvraag)) {
        return `<p>Uw recht op ${aanvraag.titel} is beëindigd per ${defaultDateFormat(aanvraag.datumEindeGeldigheid || '')}.</p><p>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>`;
      }
      return `
<p>U hoeft de ${aanvraag.titel} niet elk jaar opnieuw aan te vragen. De gemeente verlengt de regeling stilzwijgend, maar controleert wel elk jaar of u nog in aanmerking komt.</p>
<p>U kunt dan ook een brief krijgen met het verzoek om extra informatie te geven.</p>
<p><a href="${INFO_LINK}">Als er wijzigingen zijn in uw situatie moet u die direct doorgeven</a>.</p>`;
    },
  },
} as const;

const descriptionsByStatus = Object.fromEntries(
  Object.values(lineItemConfig).map(({ status, description }) => [
    status,
    description,
  ])
);

const ORPHAN_REGELING_ID_START = 30;

let statustreinId = 1;
let statustreinOrphansId = ORPHAN_REGELING_ID_START;

function getStatusDate(
  status: StatusLineItem['status'],
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
): string {
  switch (status) {
    case lineItemConfig.aanvraag.status:
    case lineItemConfig.aanvraagWijziging.status:
    case lineItemConfig.inBehandeling.status:
      return aanvraag.datumAanvraag;
    case lineItemConfig.besluit.status:
      return aanvraag.datumBesluit;
    case lineItemConfig.eindeRecht.status:
      return aanvraag.datumEindeGeldigheid ?? aanvraag.datumBesluit;
    default:
      break;
  }
  return '';
}

function createStatusLineItemStep(
  status: StatusLineItem['status'],
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
): StatusLineItem {
  return {
    status: process.argv.includes('--make-test-data')
      ? addResultToStatus(status, aanvraag.resultaat)
      : status,
    description: descriptionsByStatus[status](aanvraag),
    id: `${status}-${aanvraag.id}`,
    datePublished: getStatusDate(status, aanvraag),
    isActive: false,
    // We default to checked and determine which step can be unchecked later.
    isChecked: true,
    // We might want to include the beëindigingsdocumenten only for Einde recht steps.
    // Currently, documents related to Einde recht end-up in the most recent (toegewezen RTM regeling) Besluit step.
    documents:
      status !== lineItemConfig.eindeRecht.status ? aanvraag.documenten : [],
  };
}

// Adds 'afgewezen' to status if needed, to match the expected output.
// Not needed in the real implementation.
function addResultToStatus(
  status: StatusLineItem['status'],
  resultaat: ZorgnedAanvraagWithRelatedPersonsTransformed['resultaat']
) {
  if (
    status === lineItemConfig.besluit.status ||
    status === lineItemConfig.besluitWijziging.status ||
    status === lineItemConfig.aanvraag.status ||
    status === lineItemConfig.aanvraagWijziging.status
  ) {
    return `${status}${resultaat === 'toegewezen' ? '' : ' afgewezen'}`;
  }
  return status;
}

export function mapAanvragenByBetrokkenen(
  bsn: BSN,
  aanvraagSet: ZorgnedAanvraagWithRelatedPersonsTransformed[]
) {
  const aanvragenByBetrokkenen = new Map<
    string,
    ZorgnedAanvraagWithRelatedPersonsTransformed[]
  >([['orphans', []]]);
  const betrokkenenKeys = aanvraagSet
    .filter((a) => a.betrokkenen.length > 0)
    .map((a) => a.betrokkenen.sort().join(','));

  const hasSingleBetrokkene =
    new Set(aanvraagSet.flatMap((a) => a.betrokkenen)).size === 1;
  const hasOnlyAfgewezen = aanvraagSet.every(
    (a) => a.resultaat === 'afgewezen'
  );
  const hasNobetrokkenen = aanvraagSet.every(
    (a) => a.resultaat === 'toegewezen' && a.betrokkenen.length === 0
  );
  const hasSamebetrokkenen = new Set(betrokkenenKeys).size === 1;

  if (
    hasSingleBetrokkene ||
    hasOnlyAfgewezen ||
    hasNobetrokkenen ||
    hasSamebetrokkenen
  ) {
    let betrokkene: string | undefined;

    if (hasSingleBetrokkene) {
      betrokkene = aanvraagSet.find((a) => a.betrokkenen.length)
        ?.betrokkenen[0];
    } else if (hasSamebetrokkenen) {
      betrokkene = aanvraagSet[0].betrokkenen.join(',');
    }

    aanvragenByBetrokkenen.set(betrokkene ?? bsn, aanvraagSet);
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
  aanvragenByBetrokkenen: Map<
    string,
    ZorgnedAanvraagWithRelatedPersonsTransformed[]
  >
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

function getSteps(aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]) {
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
          ? lineItemConfig.besluitWijziging.status
          : lineItemConfig.besluit.status;
      return createStatusLineItemStep(besluitStatus, aanvraag);
    }

    // ============================
    // Steps for RTM FASE 1.
    // ============================
    // There must be a toegewezen RTM FASE 2 before this aanvraag for this to be a Aanvraag wijziging.
    const aanvraagStatus =
      previousRTM2?.resultaat === 'toegewezen'
        ? lineItemConfig.aanvraagWijziging.status
        : lineItemConfig.aanvraag.status;

    const aanvraagStep = createStatusLineItemStep(aanvraagStatus, aanvraag);
    return aanvraag.resultaat === 'toegewezen' &&
      aanvraagStatus === lineItemConfig.aanvraag.status
      ? [
          aanvraagStep,
          createStatusLineItemStep(
            lineItemConfig.inBehandeling.status,
            aanvraag
          ),
        ]
      : [aanvraagStep];
  });

  const mostRecentToegewezenRTM = aanvragen.findLast(
    (a) =>
      a.productIdentificatie === AV_RTM_DEEL2 && a.resultaat === 'toegewezen'
  );

  const LAST_STEP_INDEX = -1;
  const lastStep = steps.at(LAST_STEP_INDEX);

  const SECOND_TO_LAST_STEP_INDEX = -2;
  const secondToLastStep = steps.at(SECOND_TO_LAST_STEP_INDEX);

  let eindeRechtStep: StatusLineItem | null = null;
  if (mostRecentToegewezenRTM) {
    eindeRechtStep = createStatusLineItemStep(
      lineItemConfig.eindeRecht.status,
      mostRecentToegewezenRTM
    );
    steps.push(eindeRechtStep);
  }
  const isEindeRechtReached = eindeRechtStep
    ? parseISO(eindeRechtStep.datePublished) >= new Date()
    : false;

  if (eindeRechtStep) {
    // If einde recht is not reached, the second to last step is active.
    if (secondToLastStep) {
      secondToLastStep.isActive = !isEindeRechtReached;
    }

    // Einde recht step always is checked and active.
    eindeRechtStep.isChecked = eindeRechtStep.isActive = isEindeRechtReached;
  } else if (lastStep) {
    // If there is no einde recht step, the last step is always active.
    lastStep.isActive = true;
  }

  return steps;
}

function getBetrokkenen(
  betrokkenenMapStr: string,
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
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

function getDisplayStatus(
  steps: StatusLineItem[],
  lastDecision: string
): string {
  let displayStatus: string =
    steps.findLast((step) => step.isActive)?.status ?? '';
  if (
    displayStatus === lineItemConfig.besluit.status ||
    displayStatus === lineItemConfig.besluitWijziging.status
  ) {
    displayStatus = lastDecision;
  }

  return displayStatus;
}

function transformRTMRegelingenFrontend(
  aanvragenByBetrokkenen: Map<
    string,
    ZorgnedAanvraagWithRelatedPersonsTransformed[]
  >
) {
  const regelingen: HLIRegelingFrontend[] = [];

  for (const [
    betrokkenenMapStr,
    aanvragen,
  ] of aanvragenByBetrokkenen.entries()) {
    const steps = getSteps(aanvragen);

    if (!steps.length) {
      continue;
    }

    const id = `${betrokkenenMapStr === 'orphans' ? statustreinOrphansId++ : statustreinId++}`;
    const title = aanvragen.at(-1)?.titel || REGELING_TITLE_DEFAULT_PLACEHOLDER;
    const betrokkenen = getBetrokkenen(betrokkenenMapStr, aanvragen);
    console.log('betrokkenen', betrokkenen);

    const route = generatePath(routeConfig.detailPage.path, {
      id,
      regeling: slug(title),
    });

    // Get dates for the HLIRegeling from the steps.
    const lastRTM2 = aanvragen.findLast(
      (a) => a.productIdentificatie === AV_RTM_DEEL2
    );
    const dateDecision = lastRTM2?.datumBesluit ?? '';
    // We assume that datumEindeGeldigheid is always set for the latest RTM-2 aanvraag.
    const dateEnd = lastRTM2?.datumEindeGeldigheid ?? '';

    const dateStart =
      aanvragen.find((a) => a.productIdentificatie === AV_RTM_DEEL2)
        ?.datumBesluit ?? '';

    const isActual = !aanvragen.some(isEindeRechtReached);
    const displayStatus = getDisplayStatus(steps, dateDecision);

    const RTMRegeling: HLIRegelingFrontend = {
      id,
      steps,
      dateDecision,
      dateEnd,
      dateStart,
      documents: [],
      isActual,
      decision: 'toegewezen', // what to show here?
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
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
): ZorgnedAanvraagWithRelatedPersonsTransformed[] {
  return aanvragen.map((aanvraag) => ({
    ...aanvraag,
    documenten: aanvraag.documenten.filter(
      // We assume documents without filename are PDFs.
      (doc) => !doc.filename || doc.filename.endsWith('pdf')
    ),
  }));
}

/** Aanvragen can contain duplicate RTMDeel2. We combine the documents and drop the dupe. */
function dedupeButKeepDocuments(
  aanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
) {
  const seenAanvragen = new Map<
    string,
    ZorgnedAanvraagWithRelatedPersonsTransformed
  >();

  for (const aanvraag of aanvragen) {
    const id = aanvraag.beschiktProductIdentificatie;
    if (seenAanvragen.has(id)) {
      seenAanvragen.get(id)!.documenten.push(...aanvraag.documenten);
    } else {
      seenAanvragen.set(id, aanvraag);
    }
  }

  return Array.from(seenAanvragen.values());
}

// Aanvragen are processed in chronological order (ASC), so the order of the aanvragen from Zorgned matter.
export function transformRTMAanvragen(
  bsn: BSN,
  RTMaanvragen: ZorgnedAanvraagWithRelatedPersonsTransformed[]
) {
  const aanvragenDeduped = dedupeButKeepDocuments(RTMaanvragen);
  const aanvragenWithPdfDocumentsOnly = removeNonPdfDocuments(aanvragenDeduped);
  // RTM aanvragen are processed in chronological order (ASC), so we sort them first.
  aanvragenWithPdfDocumentsOnly.sort(sortAlpha('id', 'asc'));
  const aanvragenByBetrokkenen = mapAanvragenByBetrokkenen(
    bsn,
    aanvragenWithPdfDocumentsOnly
  );

  const aanvragenByBetrokkenenSplitted =
    splitAanvragenByBetrokkenenAtDatumGeldigheid(aanvragenByBetrokkenen);

  return transformRTMRegelingenFrontend(aanvragenByBetrokkenenSplitted);
}
