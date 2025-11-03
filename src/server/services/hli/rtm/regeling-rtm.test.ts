import { transformRTMAanvragen } from './regeling-rtm';
import type {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedPerson,
} from '../../zorgned/zorgned-types';
import type { HLIRegelingFrontend } from '../hli-regelingen-types';
import {
  aanvragenTestsetInput,
  type RTMAanvraagProps,
  type RTMTestInput,
} from './regeling-rtm-aanvragen-testset-input';
import {
  aanvragenTestsetResults,
  type RTMAanvraagTestResult,
} from './regeling-rtm-aanvragen-testset-results';

let bsn = 0;
const statustreinen: Array<HLIRegelingFrontend & { testTitle: string }> = [];

function imposeZorgnedAanvraagTransformed(
  aanvraagProps: RTMAanvraagProps,
  index: number
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
    id: `aanvraag-${index}}`,
    isActueel: false,
    leverancier: '',
    leveringsVorm: '',
    productsoortCode: '',
    beschiktProductIdentificatie: `  beschikt-product-${index}}`,
    procesAanvraagOmschrijving: '',
    beschikkingNummer: null,
    titel: 'Regeling Tegemoetkoming Meerkosten',
    ...aanvraagProps,
    betrokkenPersonen:
      aanvraagProps.betrokkenen?.map((b) => {
        const persoon: ZorgnedPerson = {
          bsn: b,
          name: `Persoon ${b}`,
          dateOfBirth: null,
          dateOfBirthFormatted: null,
          partnernaam: null,
          partnervoorvoegsel: null,
        };
        return persoon;
      }) ?? [],
  };
}

for (const testInput of aanvragenTestsetInput as RTMTestInput[]) {
  const treinen = transformRTMAanvragen(
    (bsn++).toString(),
    testInput.aanvragen.map((a, index) =>
      imposeZorgnedAanvraagTransformed(a, index)
    )
  );
  statustreinen.push(
    ...treinen.map((t) => ({ ...t, testTitle: testInput.title }))
  );
}

const statustreinenCompacted = statustreinen
  .toSorted((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10))
  .map((t) => {
    return {
      testTitle: t.testTitle,
      id: parseInt(t.id, 10),
      persoon: t.betrokkenen,
      steps: t.steps.map((s) => s.status),
      displayStatus: t.displayStatus,
    } as RTMAanvraagTestResult;
  });

describe('RTM Regeling Transformations', () => {
  test.each(
    statustreinenCompacted.map((statustreinResult, index) => {
      return [statustreinResult, aanvragenTestsetResults[index]];
    })
    // .filter(([_, expected]) => expected.id === 9)
  )('id: $id - $testTitle', (result, expected) => {
    expect(result).toEqual(expected);
  });
});
