// Weird combos of aanvragen to test the logic.

import assert from 'node:assert';

import { parseISO } from 'date-fns/parseISO';
import { generatePath } from 'react-router';
import slug from 'slugme';

import { routeConfig } from '../../../../client/pages/Thema/HLI/HLI-thema-config';
import type { StatusLineItem } from '../../../../universal/types/App.types';
import type {
  BSN,
  ZorgnedAanvraagWithRelatedPersonsTransformed,
} from '../../zorgned/zorgned-types';
import type { HLIRegelingFrontend } from '../hli-regelingen-types';
import {
  AV_RTM_DEEL1,
  AV_RTM_DEEL2,
  mapAanvragenByBetrokkenen as mapAanvragenByBetrokkenenNew,
  splitAanvragenByBetrokkenenAtDatumGeldigheid as splitAanvragenByBetrokkenenAtDatumGeldigheidNew,
} from './rtm-organizer';

export type RTMaanvraagTransformed = {
  steps: StatusLineItem[];
  persoon: string | number;
  id: number;
};

let statustreinId = 1;
let statustreinOrphansId = 30;

function getDescriptionForStatus(
  status: StatusLineItem['status'],
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
): string {
  return `Tekst bij status ${status} voor product ${aanvraag.productIdentificatie} met resultaat ${aanvraag.resultaat}`;
}

function getStatusDate(
  status: StatusLineItem['status'],
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
): string {
  switch (status) {
    case 'Aanvraag':
    case 'Aanvraag wijziging':
    case 'In behandeling genomen':
      return aanvraag.datumAanvraag;
    case 'Besluit':
    case 'Besluit wijziging':
      return aanvraag.datumBesluit;
    case 'Einde recht':
      return aanvraag.datumEindeGeldigheid ?? aanvraag.datumBesluit;
    default:
      break;
  }
  return '';
}

// Just a placeholder implementation of createStep, see existing implementation for actual step creation.
function createStep(
  status: StatusLineItem['status'],
  aanvraag: ZorgnedAanvraagWithRelatedPersonsTransformed
): StatusLineItem {
  return {
    status: process.argv.includes('--make-test-data')
      ? addResultToStatus(status, aanvraag.resultaat)
      : status,
    description: getDescriptionForStatus(status, aanvraag),
    id: `${status}-${aanvraag.id}`,
    datePublished: getStatusDate(status, aanvraag),
    isActive: false,
    // We default to checked and determine which step can be unchecked later.
    isChecked: true,
    // We might want to include the beëindigingsdocumenten only for Einde recht steps.
    documents: status !== 'Einde recht' ? aanvraag.documenten : [],
  };
}

// Adds 'afgewezen' to status if needed, to match the expected output.
// Not needed in the real implementation.
function addResultToStatus(
  status: StatusLineItem['status'],
  resultaat: ZorgnedAanvraagWithRelatedPersonsTransformed['resultaat']
) {
  if (
    status === 'Besluit' ||
    status === 'Besluit wijziging' ||
    status === 'Aanvraag' ||
    status === 'Aanvraag wijziging'
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
      // If afgewezen and fase 1, we cannot know the betrokkene, so we add it to orphans.
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

function splitAanvragenByBetrokkenenAtDatumGeldigheid(
  aanvragenByBetrokkenen: Map<
    string,
    ZorgnedAanvraagWithRelatedPersonsTransformed[]
  >
) {
  for (const [betrokkene, aanvragen] of aanvragenByBetrokkenen.entries()) {
    let splitIndex = 0;
    let currentSplitKey = betrokkene;

    aanvragenByBetrokkenen.set(currentSplitKey, []);

    for (const aanvraag of aanvragen) {
      aanvragenByBetrokkenen.get(currentSplitKey)?.push(aanvraag);

      if (
        aanvraag.datumEindeGeldigheid &&
        aanvraag.productIdentificatie === AV_RTM_DEEL2
      ) {
        currentSplitKey = `${betrokkene}-${++splitIndex}`;
        aanvragenByBetrokkenen.set(currentSplitKey, []);
      }
    }
  }

  return aanvragenByBetrokkenen;
}

function transformRTMRegelingenFrontend(
  aanvragenByBetrokkenen: Map<
    string,
    ZorgnedAanvraagWithRelatedPersonsTransformed[]
  >
) {
  const regelingen: HLIRegelingFrontend[] = [];

  for (const [betrokkene, aanvragen] of aanvragenByBetrokkenen.entries()) {
    // Check if there is a toegewezen aanvraag in fase 2.
    // This is useful to determine the status of fase 1 aanvragen and if we should add an "Einde recht" step at the end.
    const toegewezenRTM = aanvragen.findLast(
      (a) =>
        a.productIdentificatie === AV_RTM_DEEL2 && a.resultaat === 'toegewezen'
    );

    const steps = aanvragen.flatMap((aanvraag, index, aanvragen) => {
      const previousRTM2 = aanvragen
        .slice(0, index)
        .find((prevA) => prevA.productIdentificatie === AV_RTM_DEEL2);

      // ============================
      // Steps for RTM FASE 2.
      // ============================
      if (aanvraag.productIdentificatie === AV_RTM_DEEL2) {
        const besluitStatus =
          previousRTM2?.resultaat === 'toegewezen'
            ? 'Besluit wijziging'
            : 'Besluit';
        return createStep(besluitStatus, aanvraag);
      }

      // ============================
      // Steps for RTM FASE 1.
      // ============================
      // There must be a toegewezen RTM FASE 2 before this aanvraag for this to be a Aanvraag wijziging.
      const aanvraagStatus =
        toegewezenRTM && previousRTM2 ? 'Aanvraag wijziging' : 'Aanvraag';

      const aanvraagStep = createStep(aanvraagStatus, aanvraag);
      return aanvraag.resultaat === 'toegewezen' &&
        aanvraagStatus === 'Aanvraag'
        ? [aanvraagStep, createStep('In behandeling genomen', aanvraag)]
        : [aanvraagStep];
    });

    let eindeRechtStep: StatusLineItem | null = null;
    if (toegewezenRTM) {
      eindeRechtStep = createStep('Einde recht', toegewezenRTM);
      steps.push(eindeRechtStep);
    }
    const isEindeRechtReached = eindeRechtStep
      ? parseISO(eindeRechtStep.datePublished) >= new Date()
      : false;

    if (steps.length) {
      if (eindeRechtStep) {
        // Einde recht step always is checked and active.
        eindeRechtStep.isChecked = eindeRechtStep.isActive =
          isEindeRechtReached;
        // If einde recht is not reached, the previous step is active.
        steps.at(-2).isActive = !isEindeRechtReached;
      } else {
        // If there is no einde recht step, the last step is always active.
        steps.at(-1).isActive = true;
      }

      const betrokkenenBSNs = betrokkene.split(',').map((b) => b.split('-')[0]);
      const betrokkenPersonen = aanvragen
        .flatMap((a) => a.betrokkenPersonen)
        // Filter unique personen by BSN.
        .filter(
          (obj1, i, arr) => arr.findIndex((obj2) => obj2.bsn === obj1.bsn) === i
        );
      const betrokkenen = betrokkenenBSNs
        .map((bsn) => betrokkenPersonen.find((bp) => bp.bsn === bsn)?.name)
        .filter(Boolean)
        .join(', ');

      const title =
        aanvragen.at(-1)?.titel || 'Regeling tegemoetkoming meerkosten';
      const id = `${betrokkene === 'orphans' ? statustreinOrphansId++ : statustreinId++}`;

      const route = generatePath(routeConfig.detailPage.path, {
        id,
        regeling: slug(title),
      });

      const dateDecision =
        aanvragen.findLast((a) => a.productIdentificatie === AV_RTM_DEEL2)
          ?.datumBesluit ?? '';

      const dateEnd =
        aanvragen.findLast(
          (a) =>
            a.productIdentificatie === AV_RTM_DEEL2 && a.datumEindeGeldigheid
        )?.datumEindeGeldigheid ?? '';

      const dateStart =
        aanvragen.find((a) => a.productIdentificatie === AV_RTM_DEEL2)
          ?.datumBesluit ?? '';

      const isActual = aanvragen.some(
        (a) =>
          a.productIdentificatie === AV_RTM_DEEL2 &&
          a.resultaat === 'toegewezen' &&
          !a.datumEindeGeldigheid // Maybe we need to check the date here?
      );

      let displayStatus: string = 'In behandeling genomen';
      if (dateEnd) {
        displayStatus = 'Einde recht';
      }
      if (!dateEnd && isActual) {
        displayStatus = 'Toegwezen';
      }

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
  }

  return regelingen;
}

// Aanvragen are processed in chronological order (ASC), so the order of the aanvragen from Zorgned matter.
export function processAanvragen(
  bsn: BSN,
  aanvraagSet: ZorgnedAanvraagWithRelatedPersonsTransformed[]
) {
  const aanvragenByBetrokkenen = mapAanvragenByBetrokkenen(bsn, aanvraagSet);
  const aanvragenByBetrokkenen2 = mapAanvragenByBetrokkenenNew(
    bsn,
    aanvraagSet
  );

  assert.deepEqual(aanvragenByBetrokkenen, aanvragenByBetrokkenen2);

  const aanvragenByBetrokkenenSplitted =
    splitAanvragenByBetrokkenenAtDatumGeldigheid(aanvragenByBetrokkenen);

  const aanvragenByBetrokkenenSplitted2 =
    splitAanvragenByBetrokkenenAtDatumGeldigheidNew(aanvragenByBetrokkenen2);

  assert.deepEqual(
    aanvragenByBetrokkenenSplitted,
    aanvragenByBetrokkenenSplitted2
  );

  return transformRTMRegelingenFrontend(aanvragenByBetrokkenenSplitted);
}
