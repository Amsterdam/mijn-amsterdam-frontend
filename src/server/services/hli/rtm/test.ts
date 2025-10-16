// Weird combos of aanvragen to test the logic.

import assert from 'node:assert';

import { aanvragen } from './rtm-aanvragen';
import statustreinTestSetFromSheet from './statustrein-result-from-sheet-and-more.json';
import type { StatusLineItem } from '../../../../universal/types/App.types';
import type {
  BSN,
  ZorgnedAanvraagTransformed,
} from '../../zorgned/zorgned-types';

const RTM_FASE2 = 'RTM';
const RTM_FASE1 = 'RTM1';

type RTMaanvraagTransformed = {
  steps: StatusLineItem[];
  persoon: string | number;
  id: number;
};

let statustreinId = 1;
let statustreinOrphansId = 30;

function getDescriptionForStatus(
  status: StatusLineItem['status'],
  aanvraag: ZorgnedAanvraagTransformed
): string {
  return `Tekst bij status ${status} voor product ${aanvraag.productsoortCode} met resultaat ${aanvraag.resultaat}`;
}

function getStatusDate(
  status: StatusLineItem['status'],
  aanvraag: ZorgnedAanvraagTransformed
): string {
  // Just a placeholder date, in real implementation this would be derived from aanvraag data.
  return '2024-01-01';
}

// Just a placeholder implementation of createStep, see existing implementation for actual step creation.
function createStep(
  status: StatusLineItem['status'],
  aanvraag: ZorgnedAanvraagTransformed
): StatusLineItem {
  return {
    status: addResultToStatus(status, aanvraag.resultaat),
    description: getDescriptionForStatus(status, aanvraag),
    id: `${status}-${aanvraag.id}`,
    datePublished: getStatusDate(status, aanvraag),
    isActive: false,
    isChecked: false,
  };
}

// Adds 'afgewezen' to status if needed, to match the expected output.
// Not needed in the real implementation.
function addResultToStatus(
  status: StatusLineItem['status'],
  resultaat: ZorgnedAanvraagTransformed['resultaat']
) {
  if (
    status === 'Besluit' ||
    status === 'Aanvraag' ||
    status === 'Wijzigingsaanvraag'
  ) {
    return `${status}${resultaat === 'toegewezen' ? '' : ' afgewezen'}`;
  }
  return status;
}

function mapAanvragenByBetrokkenen(
  bsn: BSN,
  aanvraagSet: ZorgnedAanvraagTransformed[]
) {
  const aanvraagSetFiltered = aanvraagSet.filter(
    (a) =>
      (a.productsoortCode === RTM_FASE1 && !a.datumEindeGeldigheid) ||
      a.productsoortCode === RTM_FASE2
  );
  const aanvragenByBetrokkenen = new Map<string, ZorgnedAanvraagTransformed[]>([
    ['orphans', []],
  ]);
  const betrokkenenKeys = aanvraagSetFiltered
    .filter((a) => a.betrokkenen.length > 0)
    .map((a) => a.betrokkenen.sort().join(','));

  const hasSingleBetrokkene =
    new Set(aanvraagSetFiltered.flatMap((a) => a.betrokkenen)).size === 1;
  const hasOnlyAfgewezen = aanvraagSetFiltered.every(
    (a) => a.resultaat === 'afgewezen'
  );
  const hasNobetrokkenen = aanvraagSetFiltered.every(
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
      betrokkene = aanvraagSetFiltered.find((a) => a.betrokkenen.length)
        ?.betrokkenen[0];
    } else if (hasSamebetrokkenen) {
      betrokkene = aanvraagSetFiltered[0].betrokkenen.join(',');
    }

    aanvragenByBetrokkenen.set(betrokkene ?? bsn, aanvraagSetFiltered);
  } else {
    for (const aanvraag of aanvraagSetFiltered) {
      // If afgewezen and fase 1, we cannot know the betrokkene, so we add it to orphans.
      // Orphans will be assigned a separate statustrein later.
      if (
        aanvraag.resultaat === 'afgewezen' &&
        aanvraag.productsoortCode === RTM_FASE1
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
  aanvragenByBetrokkenen: Map<string, ZorgnedAanvraagTransformed[]>
) {
  for (const [betrokkene, aanvragen] of aanvragenByBetrokkenen.entries()) {
    let splitIndex = 0;
    let currentSplitKey = betrokkene;

    aanvragenByBetrokkenen.set(currentSplitKey, []);

    for (const aanvraag of aanvragen) {
      aanvragenByBetrokkenen.get(currentSplitKey)?.push(aanvraag);

      if (
        aanvraag.datumEindeGeldigheid &&
        aanvraag.productsoortCode === RTM_FASE2
      ) {
        currentSplitKey = `${betrokkene}-${++splitIndex}`;
        aanvragenByBetrokkenen.set(currentSplitKey, []);
      }
    }
  }

  return aanvragenByBetrokkenen;
}

function createStatustreinen(
  aanvragenByBetrokkenen: Map<string, ZorgnedAanvraagTransformed[]>
) {
  const statustreinen: RTMaanvraagTransformed[] = [];
  for (const [betrokkene, aanvragen] of aanvragenByBetrokkenen.entries()) {
    // Check if there is a toegewezen aanvraag in fase 2.
    // This is useful to determine the status of fase 1 aanvragen and if we should add an "Einde recht" step at the end.
    const toegewezenRTM = aanvragen.find(
      (a) => a.productsoortCode === RTM_FASE2 && a.resultaat === 'toegewezen'
    );

    const steps = aanvragen.flatMap((aanvraag, index, aanvragen) => {
      if (aanvraag.productsoortCode === RTM_FASE2) {
        return createStep('Besluit', aanvraag);
      }

      // There must be a toegewezen RTM FASE 2 before this aanvraag for this to be a wijzigingsaanvraag.
      const aanvraagStatus =
        toegewezenRTM &&
        aanvragen
          .slice(0, index)
          .some((prevA) => prevA.productsoortCode === RTM_FASE2)
          ? 'Wijzigingsaanvraag'
          : 'Aanvraag';

      const aanvraagStep = createStep(aanvraagStatus, aanvraag);
      return aanvraag.resultaat === 'toegewezen'
        ? [aanvraagStep, createStep('In behandeling', aanvraag)]
        : [aanvraagStep];
    });

    if (toegewezenRTM) {
      steps.push(createStep('Einde recht', toegewezenRTM));
    }

    if (steps.length) {
      const statustrein: RTMaanvraagTransformed = {
        id: betrokkene === 'orphans' ? statustreinOrphansId++ : statustreinId++,
        persoon: betrokkene,
        steps,
      };
      statustreinen.push(statustrein);
    }
  }

  return statustreinen;
}

// Aanvragen are processed in chronological order (ASC), so the order of the aanvragen from Zorgned matter.
function processAanvragen(bsn: BSN, aanvraagSet: ZorgnedAanvraagTransformed[]) {
  const aanvragenByBetrokkenen = mapAanvragenByBetrokkenen(bsn, aanvraagSet);
  const aanvragenByBetrokkenenSplitted =
    splitAanvragenByBetrokkenenAtDatumGeldigheid(aanvragenByBetrokkenen);

  return createStatustreinen(aanvragenByBetrokkenenSplitted);
}

let bsn = 0;
const statustreinen: RTMaanvraagTransformed[] = [];

for (const aanvraagSet of aanvragen as unknown as ZorgnedAanvraagTransformed[][]) {
  const treinen = processAanvragen((bsn++).toString(), aanvraagSet);
  statustreinen.push(...treinen);
}

const statustreinenCompacted = statustreinen
  .toSorted((a, b) => a.id - b.id)
  .map((t) => {
    return {
      id: t.id,
      persoon: t.persoon,
      steps: t.steps.map((s) => s.status),
    };
  });

statustreinenCompacted.forEach((trein, i) => {
  assert.deepEqual(
    trein,
    statustreinTestSetFromSheet[i],
    `Mismatch in trein ${i}`
  );
});

console.log(statustreinenCompacted);
