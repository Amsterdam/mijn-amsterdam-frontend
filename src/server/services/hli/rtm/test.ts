import assert from 'node:assert';

import { aanvragen } from './rtm-aanvragen';
import { transformRTMAanvragen } from './rtm-organizer';
import statustreinTestSetFromSheet from './statustrein-result-from-sheet-and-more.json';
import type {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedPerson,
} from '../../zorgned/zorgned-types';
import type { HLIRegelingFrontend } from '../hli-regelingen-types';

let bsn = 0;
const statustreinen: HLIRegelingFrontend[] = [];

type RTMAanvraagProps = {
  productIdentificatie: 'AV-RTM1' | 'AV-RTM';
  betrokkenen: string[];
  resultaat: 'toegewezen' | 'afgewezen';
  datumEindeGeldigheid: string | null;
};

function imposeZorgnedAanvraagTransformed(
  aanvraagProps: RTMAanvraagProps
): ZorgnedAanvraagWithRelatedPersonsTransformed {
  return {
    bsnAanvrager: '',
    datumAanvraag: '',
    datumBeginLevering: null,
    datumBesluit: '',
    datumEindeLevering: null,
    datumIngangGeldigheid: null,
    datumOpdrachtLevering: null,
    datumToewijzing: null,
    documenten: [],
    id: '',
    isActueel: false,
    leverancier: '',
    leveringsVorm: '',
    productsoortCode: '',
    beschiktProductIdentificatie: '',
    beschikkingNummer: null,
    titel: '',
    ...aanvraagProps,
    betrokkenPersonen: aanvraagProps.betrokkenen.map((b) => {
      const persoon: ZorgnedPerson = {
        bsn: b,
        name: `Persoon ${b}`,
        dateOfBirth: null,
        dateOfBirthFormatted: null,
        partnernaam: null,
        partnervoorvoegsel: null,
      };
      return persoon;
    }),
  };
}

for (const aanvraagSet of aanvragen as unknown as RTMAanvraagProps[][]) {
  const treinen = transformRTMAanvragen(
    (bsn++).toString(),
    aanvraagSet.map(imposeZorgnedAanvraagTransformed)
  );
  statustreinen.push(...treinen);
}

const statustreinenCompacted = statustreinen
  .toSorted((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10))
  .map((t) => {
    return {
      id: parseInt(t.id, 10),
      persoon: t.betrokkenen,
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
