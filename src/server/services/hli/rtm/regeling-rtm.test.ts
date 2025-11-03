import { forTesting, transformRTMAanvragen } from './regeling-rtm';
import {
  aanvraag,
  aanvragenTestsetInput,
  AFW,
  RTM1,
  RTM2,
  TOE,
  type RTMAanvraagProps,
  type RTMTestInput,
} from './regeling-rtm-aanvragen-testset';
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
    titel: 'Regeling tegemoetkoming meerkosten',
    bsnAanvrager: '',
    datumAanvraag: '',
    datumBeginLevering: null,
    datumBesluit: '',
    datumEindeLevering: null,
    datumIngangGeldigheid: null,
    datumOpdrachtLevering: null,
    datumToewijzing: null,
    documenten: [],
    id: `aanvraag-${index}`,
    isActueel: false,
    leverancier: '',
    leveringsVorm: '',
    productsoortCode: '',
    beschiktProductIdentificatie: `  beschikt-product-${index}`,
    procesAanvraagOmschrijving: '',
    beschikkingNummer: null,
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
        };
      });

    test(testInput.title, () => {
      expect(aanvragenTransformed).toStrictEqual(testInput.expected);
    });
  }
});

describe('RTM aanvraag transformation', () => {
  test('transform complete aanvraag single aanvrager/ontvanger', () => {
    const aanvragen = [
      aanvraag(RTM1, TOE, ['X1'], {
        id: '1-2',
        datumAanvraag: '2024-01-01',
        documenten: [{ id: 'foo' }],
        beschiktProductIdentificatie: '12345',
        betrokkenPersonen: [{ bsn: 'X1', name: 'Persoon X1' }],
      }),
      aanvraag(RTM1, TOE, ['X1'], {
        id: '1-1',
        datumAanvraag: '2024-01-01',
        documenten: [{ id: 'bar' }],
        beschiktProductIdentificatie: '12345',
        betrokkenPersonen: [{ bsn: 'X1', name: 'Persoon X1' }],
      }),
      aanvraag(RTM2, TOE, ['X1'], {
        id: '1-3',
        datumBesluit: '2024-02-01',
        documenten: [{ id: 'baz' }],
        betrokkenPersonen: [{ bsn: 'X1', name: 'Persoon X1' }],
        beschiktProductIdentificatie: '12435687',
      }),
      aanvraag(RTM1, TOE, ['X1'], {
        id: '2-1',
        datumAanvraag: '2025-01-01',
        documenten: [{ id: 'bar' }],
        beschiktProductIdentificatie: '7766778',
        betrokkenPersonen: [{ bsn: 'X1', name: 'Persoon X1' }],
      }),
      aanvraag(RTM2, TOE, ['X1'], {
        id: '2-2',
        datumBesluit: '2025-02-01',
        documenten: [{ id: 'baz' }],
        betrokkenPersonen: [{ bsn: 'X1', name: 'Persoon X1' }],
        beschiktProductIdentificatie: '890123',
      }),
    ] as ZorgnedAanvraagWithRelatedPersonsTransformed[];

    const transformed = transformRTMAanvragen('12345', aanvragen);
    expect(transformed).toMatchInlineSnapshot(`
      [
        {
          "betrokkenen": "Persoon X1",
          "dateDecision": "2025-02-01",
          "dateEnd": "",
          "dateStart": "2024-02-01",
          "decision": "toegewezen",
          "displayStatus": "Einde recht",
          "documents": [],
          "id": "29",
          "isActual": true,
          "link": {
            "title": "Meer informatie",
            "to": "/regelingen-bij-laag-inkomen/regeling/regeling-tegemoetkoming-meerkosten/29",
          },
          "steps": [
            {
              "datePublished": "2024-01-01",
              "description": "",
              "documents": [
                {
                  "id": "bar",
                },
                {
                  "id": "foo",
                },
              ],
              "id": "aanvraag-1-1",
              "isActive": false,
              "isChecked": true,
              "status": "Aanvraag",
            },
            {
              "datePublished": "2024-01-01",
              "description": "<p>Voordat u de Regeling tegemoetkoming meerkosten krijgt, moet u een afspraak maken voor een medische keuring bij de GGD. In de brief staat hoe u dat doet.</p>",
              "documents": [],
              "id": "in-behandeling-genomen-1-1",
              "isActive": false,
              "isChecked": true,
              "status": "In behandeling genomen",
            },
            {
              "datePublished": "2024-02-01",
              "description": "<p>
          U krijgt Regeling tegemoetkoming meerkosten per .
          </p>
          <p>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>
        ",
              "documents": [
                {
                  "id": "baz",
                },
              ],
              "id": "besluit-1-3",
              "isActive": false,
              "isChecked": true,
              "status": "Besluit",
            },
            {
              "datePublished": "2025-01-01",
              "description": "<p>U heeft een aanvraag gedaan voor aanpassing op uw lopende RTM regeling.</p>
      <p>Hiervoor moet u een afspraak maken voor een medisch gesprek bij de GGD. In de brief staat hoe u dat doet.</p>",
              "documents": [
                {
                  "id": "bar",
                },
              ],
              "id": "aanvraag-wijziging-2-1",
              "isActive": false,
              "isChecked": true,
              "status": "Aanvraag wijziging",
            },
            {
              "datePublished": "",
              "description": "<p>Uw aanvraag voor een wijziging is afgehandeld. Bekijk de brief voor meer informatie hierover.</p>",
              "documents": [
                {
                  "id": "baz",
                },
              ],
              "id": "besluit-wijziging-2-2",
              "isActive": false,
              "isChecked": true,
              "status": "Besluit wijziging",
            },
            {
              "datePublished": "2025-02-01",
              "description": "
      <p>U hoeft de Regeling tegemoetkoming meerkosten niet elk jaar opnieuw aan te vragen. De gemeente verlengt de regeling stilzwijgend, maar controleert wel elk jaar of u nog in aanmerking komt.</p>
      <p>U kunt dan ook een brief krijgen met het verzoek om extra informatie te geven.</p>
      <p><a href="https://www.amsterdam.nl/werk-en-inkomen/regelingen-bij-laag-inkomen-pak-je-kans/regelingen-alfabet/extra-geld-als-u-chronisch-ziek-of/">Als er wijzigingen zijn in uw situatie moet u die direct doorgeven</a>.</p>",
              "documents": [],
              "id": "einde-recht-2-2",
              "isActive": true,
              "isChecked": true,
              "status": "Einde recht",
            },
          ],
          "title": "Regeling tegemoetkoming meerkosten",
        },
      ]
    `);
  });

  test('transform complete aanvraag multiple betrokkenen/ontvangers', () => {
    const aanvragen = [
      aanvraag(RTM1, TOE, ['X1', 'X2'], {
        id: '1-2',
        datumAanvraag: '2024-01-01',
        documenten: [{ id: 'foo' }],
        beschiktProductIdentificatie: '12345',
        betrokkenPersonen: [
          { bsn: 'X1', name: 'Persoon X1' },
          { bsn: 'X2', name: 'Persoon X2' },
        ],
      }),
      aanvraag(RTM1, TOE, ['X1', 'X2'], {
        id: '1-1',
        datumAanvraag: '2025-01-01',
        documenten: [{ id: 'bar' }],
        beschiktProductIdentificatie: '7654321',
        betrokkenPersonen: [
          { bsn: 'X1', name: 'Persoon X1' },
          { bsn: 'X2', name: 'Persoon X2' },
        ],
      }),
    ] as ZorgnedAanvraagWithRelatedPersonsTransformed[];

    const transformed = transformRTMAanvragen('12345', aanvragen);
    expect(transformed).toMatchInlineSnapshot(`
      [
        {
          "betrokkenen": "Persoon X1, Persoon X2",
          "dateDecision": "",
          "dateEnd": "",
          "dateStart": "",
          "decision": "toegewezen",
          "displayStatus": "In behandeling genomen",
          "documents": [],
          "id": "30",
          "isActual": true,
          "link": {
            "title": "Meer informatie",
            "to": "/regelingen-bij-laag-inkomen/regeling/regeling-tegemoetkoming-meerkosten/30",
          },
          "steps": [
            {
              "datePublished": "2025-01-01",
              "description": "",
              "documents": [
                {
                  "id": "bar",
                },
              ],
              "id": "aanvraag-1-1",
              "isActive": false,
              "isChecked": true,
              "status": "Aanvraag",
            },
            {
              "datePublished": "2025-01-01",
              "description": "<p>Voordat u de Regeling tegemoetkoming meerkosten krijgt, moet u een afspraak maken voor een medische keuring bij de GGD. In de brief staat hoe u dat doet.</p><p><strong>Vraagt u de Regeling tegemoetkoming meerkosten (ook) voor andere gezinsleden aan?</strong><br/>De uitslag van de aanvraag is op Mijn Amsterdam te vinden met de DigiD login gegevens van uw gezinsleden.</p>
                <p>Nog geen DigiD login gegevens? <a rel="noopener noreferrer" href="https://www.digid.nl/aanvragen-en-activeren/digid-aanvragen">Ga naar DigiD aanvragen.</a></p>
                <p><strong>Gedeeltelijke afwijzing voor u of uw gezinsleden?</strong><br/>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>",
              "documents": [],
              "id": "in-behandeling-genomen-1-1",
              "isActive": false,
              "isChecked": true,
              "status": "In behandeling genomen",
            },
            {
              "datePublished": "2024-01-01",
              "description": "",
              "documents": [
                {
                  "id": "foo",
                },
              ],
              "id": "aanvraag-1-2",
              "isActive": false,
              "isChecked": true,
              "status": "Aanvraag",
            },
            {
              "datePublished": "2024-01-01",
              "description": "<p>Voordat u de Regeling tegemoetkoming meerkosten krijgt, moet u een afspraak maken voor een medische keuring bij de GGD. In de brief staat hoe u dat doet.</p><p><strong>Vraagt u de Regeling tegemoetkoming meerkosten (ook) voor andere gezinsleden aan?</strong><br/>De uitslag van de aanvraag is op Mijn Amsterdam te vinden met de DigiD login gegevens van uw gezinsleden.</p>
                <p>Nog geen DigiD login gegevens? <a rel="noopener noreferrer" href="https://www.digid.nl/aanvragen-en-activeren/digid-aanvragen">Ga naar DigiD aanvragen.</a></p>
                <p><strong>Gedeeltelijke afwijzing voor u of uw gezinsleden?</strong><br/>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>",
              "documents": [],
              "id": "in-behandeling-genomen-1-2",
              "isActive": true,
              "isChecked": true,
              "status": "In behandeling genomen",
            },
          ],
          "title": "Regeling tegemoetkoming meerkosten",
        },
      ]
    `);
  });

  test('transform complete aanvraag single betrokkene/ontvanger', () => {
    const aanvragen = [
      aanvraag(RTM2, TOE, ['X1'], {
        id: '2-2',
        datumBesluit: '2025-02-01',
        documenten: [{ id: 'baz' }],
        betrokkenPersonen: [{ bsn: 'X1', name: 'Persoon X1' }],
        beschiktProductIdentificatie: '890123',
      }),
      aanvraag(RTM2, TOE, ['X1'], {
        id: '3-1',
        datumBesluit: '2026-02-01',
        documenten: [{ id: 'baz' }],
        betrokkenPersonen: [{ bsn: 'X1', name: 'Persoon X1' }],
        beschiktProductIdentificatie: '1232224',
      }),
      aanvraag(RTM2, AFW, [], {
        id: '4-1',
        datumBesluit: '2026-05-01',
        documenten: [{ id: 'baz' }],
        betrokkenPersonen: [],
        beschiktProductIdentificatie: '1232224',
      }),
    ] as ZorgnedAanvraagWithRelatedPersonsTransformed[];

    const transformed = transformRTMAanvragen('12345', aanvragen);
    expect(transformed).toMatchInlineSnapshot(`
      [
        {
          "betrokkenen": "Persoon X1",
          "dateDecision": "2026-02-01",
          "dateEnd": "",
          "dateStart": "2025-02-01",
          "decision": "toegewezen",
          "displayStatus": "Besluit wijziging",
          "documents": [],
          "id": "31",
          "isActual": true,
          "link": {
            "title": "Meer informatie",
            "to": "/regelingen-bij-laag-inkomen/regeling/regeling-tegemoetkoming-meerkosten/31",
          },
          "steps": [
            {
              "datePublished": "2025-02-01",
              "description": "<p>
          U krijgt Regeling tegemoetkoming meerkosten per .
          </p>
          <p>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>
        ",
              "documents": [
                {
                  "id": "baz",
                },
              ],
              "id": "besluit-2-2",
              "isActive": false,
              "isChecked": true,
              "status": "Besluit",
            },
            {
              "datePublished": "",
              "description": "<p>Uw aanvraag voor een wijziging is afgehandeld. Bekijk de brief voor meer informatie hierover.</p>",
              "documents": [
                {
                  "id": "baz",
                },
                {
                  "id": "baz",
                },
              ],
              "id": "besluit-wijziging-3-1",
              "isActive": true,
              "isChecked": true,
              "status": "Besluit wijziging",
            },
            {
              "datePublished": "2026-02-01",
              "description": "
      <p>U hoeft de Regeling tegemoetkoming meerkosten niet elk jaar opnieuw aan te vragen. De gemeente verlengt de regeling stilzwijgend, maar controleert wel elk jaar of u nog in aanmerking komt.</p>
      <p>U kunt dan ook een brief krijgen met het verzoek om extra informatie te geven.</p>
      <p><a href="https://www.amsterdam.nl/werk-en-inkomen/regelingen-bij-laag-inkomen-pak-je-kans/regelingen-alfabet/extra-geld-als-u-chronisch-ziek-of/">Als er wijzigingen zijn in uw situatie moet u die direct doorgeven</a>.</p>",
              "documents": [],
              "id": "einde-recht-3-1",
              "isActive": false,
              "isChecked": false,
              "status": "Einde recht",
            },
          ],
          "title": "Regeling tegemoetkoming meerkosten",
        },
      ]
    `);
  });
});

describe('RTM combine and dedupe', () => {
  test('Filters out non-pdf documents', () => {
    const regelingen = forTesting.removeNonPdfDocuments([
      {
        documenten: [
          {
            id: '1',
            title: 'Info bij regeling',
            filename: 'abc.xlsx',
            url: '',
            datePublished: '2025-01-01',
          },
          {
            id: '2',
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

  test('Dedupes aanvragen that have the same beschiktProductIdentificatie, but keeps the included documents', () => {
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
