import { forTesting, transformRTMAanvragen } from './regeling-rtm';
import {
  aanvragenTestsetInput,
  type RTMAanvraagProps,
  type RTMTestInput,
} from './regeling-rtm-aanvragen-testset-input';
import { type RTMAanvraagTestResult } from './regeling-rtm-aanvragen-testset-results';
import type {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedPerson,
} from '../../zorgned/zorgned-types';

let bsn = 0;

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

describe('RTM aanvraag transformation and grouping', () => {
  for (const testInput of aanvragenTestsetInput as RTMTestInput[]) {
    const bsnLoggedinUser = (bsn++).toString();
    const aanvragenTransformed = transformRTMAanvragen(
      bsnLoggedinUser,
      testInput.aanvragen.map(imposeZorgnedAanvraagTransformed)
    )
      .toSorted((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10))
      .map((t) => {
        return {
          id: parseInt(t.id, 10),
          persoon: t.betrokkenen,
          steps: t.steps.map((s) => s.status),
          displayStatus: t.displayStatus,
        } as RTMAanvraagTestResult;
      });

    test(testInput.title, () => {
      expect(aanvragenTransformed).toStrictEqual(testInput.expected);
    });
  }
});

describe('RTM processing', () => {
  test('Does not contain docx (word) documents', () => {
    const regelingen = forTesting.removeNonPdfDocuments([
      {
        documenten: [
          {
            id: '1',
            title: 'Info bij regeling',
            filename: 'abc.docx',
            url: '',
            datePublished: '2025-01-01',
          },
        ],
      },
    ] as ZorgnedAanvraagWithRelatedPersonsTransformed[]);

    expect(regelingen.length).toBe(1);
    const regeling = regelingen[0];
    expect(regeling.documenten).toStrictEqual([]);
  });

  test('Dedupes aanvragen that belong to the same voorziening", but keeps the included documents', () => {
    const regelingen = forTesting.dedupeButKeepDocuments([
      {
        beschiktProductIdentificatie: '1',
        documenten: ['foo', 'bar'],
      },
      {
        beschiktProductIdentificatie: '1',
        documenten: ['baz'],
      },
      {
        beschiktProductIdentificatie: '2',
        documenten: ['world'],
      },
    ] as unknown as ZorgnedAanvraagWithRelatedPersonsTransformed[]);

    expect(regelingen.length).toBe(2);
    expect(regelingen).toEqual([
      {
        beschiktProductIdentificatie: '1',
        documenten: ['foo', 'bar', 'baz'],
      },
      {
        beschiktProductIdentificatie: '2',
        documenten: ['world'],
      },
    ]);
  });
});
