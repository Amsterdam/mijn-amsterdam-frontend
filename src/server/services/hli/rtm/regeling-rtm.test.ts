import {
  forTesting,
  RTM_SPECIFICATIE_TITLE,
  transformRTMAanvragen,
} from './regeling-rtm';
import {
  aanvraag,
  aanvragenTestsetInput,
  RTM1,
  RTM2,
  AFW,
  TOE,
  type RTMAanvraagProps,
  type RTMTestInput,
} from './regeling-rtm-aanvragen-testset';
import type {
  ZorgnedAanvraagWithRelatedPersonsTransformed,
  ZorgnedPerson,
} from '../../zorgned/zorgned-types';

vi.mock('../../../helpers/encrypt-decrypt', async (requireActual) => {
  return {
    ...((await requireActual()) as object),
    encryptSessionIdWithRouteIdParam: () => {
      return 'test-encrypted-id';
    },
    decrypt: () => 'session-id:e6ed38c3-a44a-4c16-97c1-89d7ebfca095',
  };
});

function imposeZorgnedAanvraagTransformed(
  aanvraagProps: RTMAanvraagProps,
  index: number
): ZorgnedAanvraagWithRelatedPersonsTransformed {
  return {
    titel: 'Regeling tegemoetkoming meerkosten',
    bsnAanvrager: '',
    datumAanvraag: '2023-01-01',
    datumBeginLevering: null,
    datumBesluit: '',
    datumEindeLevering: null,
    datumIngangGeldigheid: null,
    datumOpdrachtLevering: null,
    datumToewijzing: null,
    documenten: [],
    id: `aanvraag-${index}`,
    prettyID: `aanvraag-${index}`,
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
    const aanvragenTransformed = transformRTMAanvragen(
      'xxxx-session-id-xxxx',
      {
        bsn: testInput.bsnLoggedinUser,
        name: `Persoon ${testInput.bsnLoggedinUser}`,
      },
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

    const tstFn = testInput.only ? test.only : test;

    tstFn(testInput.title, () => {
      expect(aanvragenTransformed).toStrictEqual(testInput.expected);
    });
  }
});

describe('RTM aanvraag transformation', () => {
  test('transform complete aanvraag single aanvrager/ontvanger', () => {
    const bsnLoggedinUser = 'X1';
    const aanvragen = [
      aanvraag(RTM1, TOE, [bsnLoggedinUser], {
        id: '1-2',
        datumAanvraag: '2024-01-01',
        documenten: [{ id: 'foo' }],
        beschiktProductIdentificatie: '12345',
        betrokkenPersonen: [{ bsn: bsnLoggedinUser, name: 'Persoon X1' }],
      }),
      aanvraag(RTM1, TOE, [bsnLoggedinUser], {
        id: '1-1',
        datumAanvraag: '2024-01-01',
        documenten: [{ id: 'bar' }],
        beschiktProductIdentificatie: '12345',
        betrokkenPersonen: [{ bsn: bsnLoggedinUser, name: 'Persoon X1' }],
      }),
      aanvraag(RTM2, TOE, [bsnLoggedinUser], {
        id: '1-3',
        datumBesluit: '2024-02-01',
        datumIngangGeldigheid: '2024-05-01',
        documenten: [{ id: 'baz' }],
        betrokkenPersonen: [{ bsn: bsnLoggedinUser, name: 'Persoon X1' }],
        beschiktProductIdentificatie: '12435687',
      }),
      aanvraag(RTM1, TOE, [bsnLoggedinUser], {
        id: '2-1',
        datumAanvraag: '2025-01-01',
        documenten: [{ id: 'bar' }],
        beschiktProductIdentificatie: '7766778',
        betrokkenPersonen: [{ bsn: bsnLoggedinUser, name: 'Persoon X1' }],
      }),
      aanvraag(RTM2, TOE, [bsnLoggedinUser], {
        id: '2-2',
        datumBesluit: '2025-02-01',
        datumIngangGeldigheid: '2025-05-01',
        documenten: [{ id: 'baz' }],
        betrokkenPersonen: [{ bsn: bsnLoggedinUser, name: 'Persoon X1' }],
        beschiktProductIdentificatie: '890123',
      }),
    ] as ZorgnedAanvraagWithRelatedPersonsTransformed[];

    const transformed = transformRTMAanvragen(
      'xxx-session-id-xxxx',
      { bsn: bsnLoggedinUser, name: `Persoon ${bsnLoggedinUser}` },
      aanvragen
    );
    expect(transformed).toMatchInlineSnapshot(`
      [
        {
          "betrokkenen": "Persoon X1",
          "dateDecision": "2025-02-01",
          "dateEnd": "",
          "dateRequest": "",
          "dateStart": "2024-02-01",
          "decision": "toegewezen",
          "displayStatus": "Besluit wijziging",
          "documents": [],
          "id": "2984003010",
          "isActual": true,
          "link": {
            "title": "Meer informatie",
            "to": "/regelingen-bij-laag-inkomen/regeling/regeling-tegemoetkoming-meerkosten/2984003010",
          },
          "steps": [
            {
              "datePublished": "2024-01-01",
              "description": "",
              "documents": [],
              "id": "aanvraag-193359720",
              "isActive": false,
              "isChecked": true,
              "status": "Aanvraag",
            },
            {
              "datePublished": "2024-01-01",
              "description": "<p>Voordat u de Regeling tegemoetkoming meerkosten krijgt, moet u een afspraak maken voor een medische keuring bij de GGD. In de brief staat hoe u dat doet.</p>",
              "documents": [
                {
                  "id": "test-encrypted-id",
                  "url": "http://bff-api-host/api/v1/services/v1/stadspas-en-andere-regelingen/document?id=test-encrypted-id",
                },
              ],
              "id": "in-behandeling-genomen-193359720",
              "isActive": false,
              "isChecked": true,
              "status": "In behandeling genomen",
            },
            {
              "datePublished": "2024-02-01",
              "description": "<p>
          U krijgt Regeling tegemoetkoming meerkosten per 01 mei 2024.
          </p>
          <p>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>
        ",
              "documents": [
                {
                  "id": "test-encrypted-id",
                  "url": "http://bff-api-host/api/v1/services/v1/stadspas-en-andere-regelingen/document?id=test-encrypted-id",
                },
              ],
              "id": "besluit-193361898",
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
                  "id": "test-encrypted-id",
                  "url": "http://bff-api-host/api/v1/services/v1/stadspas-en-andere-regelingen/document?id=test-encrypted-id",
                },
              ],
              "id": "aanvraag-wijziging-193359723",
              "isActive": false,
              "isChecked": true,
              "status": "Aanvraag wijziging",
            },
            {
              "datePublished": "",
              "description": "<p>Uw aanvraag voor een wijziging is afgehandeld. Bekijk de brief voor meer informatie hierover.</p>",
              "documents": [
                {
                  "id": "test-encrypted-id",
                  "url": "http://bff-api-host/api/v1/services/v1/stadspas-en-andere-regelingen/document?id=test-encrypted-id",
                },
              ],
              "id": "besluit-wijziging-193360808",
              "isActive": true,
              "isChecked": true,
              "status": "Besluit wijziging",
            },
            {
              "datePublished": "",
              "description": "
      <p>U hoeft de Regeling tegemoetkoming meerkosten niet elk jaar opnieuw aan te vragen. De gemeente verlengt de regeling stilzwijgend, maar controleert wel elk jaar of u nog in aanmerking komt.</p>
      <p>U kunt dan ook een brief krijgen met het verzoek om extra informatie te geven.</p>
      <p><a href="https://www.amsterdam.nl/werk-en-inkomen/regelingen-bij-laag-inkomen-pak-je-kans/regelingen-alfabet/extra-geld-als-u-chronisch-ziek-of/">Als er wijzigingen zijn in uw situatie moet u die direct doorgeven</a>.</p>",
              "documents": [
                {
                  "id": "test-encrypted-id",
                  "url": "http://bff-api-host/api/v1/services/v1/stadspas-en-andere-regelingen/document?id=test-encrypted-id",
                },
              ],
              "id": "einde-recht-193360808",
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

    const transformed = transformRTMAanvragen(
      'xxxx-session-id-xxxx',
      { bsn: '12345', name: `Persoon 12345` },
      aanvragen
    );
    expect(transformed).toMatchInlineSnapshot(`
      [
        {
          "betrokkenen": "Persoon X1, Persoon X2",
          "dateDecision": "",
          "dateEnd": "",
          "dateRequest": "2024-01-01",
          "dateStart": "",
          "decision": "toegewezen",
          "displayStatus": "In behandeling genomen",
          "documents": [],
          "id": "210986318",
          "isActual": true,
          "link": {
            "title": "Meer informatie",
            "to": "/regelingen-bij-laag-inkomen/regeling/regeling-tegemoetkoming-meerkosten/210986318",
          },
          "steps": [
            {
              "datePublished": "2025-01-01",
              "description": "",
              "documents": [],
              "id": "aanvraag-193359720",
              "isActive": false,
              "isChecked": true,
              "status": "Aanvraag",
            },
            {
              "datePublished": "2025-01-01",
              "description": "<p>Voordat u de Regeling tegemoetkoming meerkosten krijgt, moet u een afspraak maken voor een medische keuring bij de GGD. In de brief staat hoe u dat doet.</p><p><strong>Vraagt u de Regeling tegemoetkoming meerkosten (ook) voor andere gezinsleden aan?</strong><br/>De uitslag van de aanvraag is op Mijn Amsterdam te vinden met de DigiD login gegevens van uw gezinsleden.</p>
                <p>Nog geen DigiD login gegevens? <a rel="noopener noreferrer" href="https://www.digid.nl/aanvragen-en-activeren/digid-aanvragen">Ga naar DigiD aanvragen.</a></p>
                <p><strong>Gedeeltelijke afwijzing voor u of uw gezinsleden?</strong><br/>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>",
              "documents": [
                {
                  "id": "test-encrypted-id",
                  "url": "http://bff-api-host/api/v1/services/v1/stadspas-en-andere-regelingen/document?id=test-encrypted-id",
                },
              ],
              "id": "in-behandeling-genomen-193359720",
              "isActive": false,
              "isChecked": true,
              "status": "In behandeling genomen",
            },
            {
              "datePublished": "2024-01-01",
              "description": "",
              "documents": [],
              "id": "aanvraag-193360811",
              "isActive": false,
              "isChecked": true,
              "status": "Aanvraag",
            },
            {
              "datePublished": "2024-01-01",
              "description": "<p>Voordat u de Regeling tegemoetkoming meerkosten krijgt, moet u een afspraak maken voor een medische keuring bij de GGD. In de brief staat hoe u dat doet.</p><p><strong>Vraagt u de Regeling tegemoetkoming meerkosten (ook) voor andere gezinsleden aan?</strong><br/>De uitslag van de aanvraag is op Mijn Amsterdam te vinden met de DigiD login gegevens van uw gezinsleden.</p>
                <p>Nog geen DigiD login gegevens? <a rel="noopener noreferrer" href="https://www.digid.nl/aanvragen-en-activeren/digid-aanvragen">Ga naar DigiD aanvragen.</a></p>
                <p><strong>Gedeeltelijke afwijzing voor u of uw gezinsleden?</strong><br/>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>",
              "documents": [
                {
                  "id": "test-encrypted-id",
                  "url": "http://bff-api-host/api/v1/services/v1/stadspas-en-andere-regelingen/document?id=test-encrypted-id",
                },
              ],
              "id": "in-behandeling-genomen-193360811",
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
    const bsnLoggedinUser = 'X1';
    const aanvragen = [
      aanvraag(RTM2, TOE, [bsnLoggedinUser], {
        id: '2-2',
        datumBesluit: '2025-02-01',
        documenten: [{ id: 'baz' }],
        betrokkenPersonen: [{ bsn: bsnLoggedinUser, name: 'Persoon X1' }],
        beschiktProductIdentificatie: '890123',
      }),
      aanvraag(RTM2, TOE, [bsnLoggedinUser], {
        id: '3-1',
        datumBesluit: '2026-02-01',
        documenten: [{ id: 'baz' }],
        betrokkenPersonen: [{ bsn: bsnLoggedinUser, name: 'Persoon X1' }],
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

    const transformed = transformRTMAanvragen(
      'xxxx-session-id-xxxx',
      { bsn: bsnLoggedinUser },
      aanvragen
    );
    expect(transformed).toMatchInlineSnapshot(`
      [
        {
          "betrokkenen": "Persoon X1",
          "dateDecision": "2026-02-01",
          "dateEnd": "",
          "dateRequest": "",
          "dateStart": "2025-02-01",
          "decision": "toegewezen",
          "displayStatus": "Besluit wijziging",
          "documents": [],
          "id": "3588173220",
          "isActual": true,
          "link": {
            "title": "Meer informatie",
            "to": "/regelingen-bij-laag-inkomen/regeling/regeling-tegemoetkoming-meerkosten/3588173220",
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
                  "id": "test-encrypted-id",
                  "url": "http://bff-api-host/api/v1/services/v1/stadspas-en-andere-regelingen/document?id=test-encrypted-id",
                },
              ],
              "id": "besluit-193360808",
              "isActive": false,
              "isChecked": true,
              "status": "Besluit",
            },
            {
              "datePublished": "",
              "description": "<p>Uw aanvraag voor een wijziging is afgehandeld. Bekijk de brief voor meer informatie hierover.</p>",
              "documents": [
                {
                  "id": "test-encrypted-id",
                  "url": "http://bff-api-host/api/v1/services/v1/stadspas-en-andere-regelingen/document?id=test-encrypted-id",
                },
              ],
              "id": "besluit-wijziging-193359722",
              "isActive": false,
              "isChecked": true,
              "status": "Besluit wijziging",
            },
            {
              "datePublished": "",
              "description": "<p>Uw aanvraag voor een wijziging is afgehandeld. Bekijk de brief voor meer informatie hierover.</p>",
              "documents": [
                {
                  "id": "test-encrypted-id",
                  "url": "http://bff-api-host/api/v1/services/v1/stadspas-en-andere-regelingen/document?id=test-encrypted-id",
                },
              ],
              "id": "besluit-wijziging-193359725",
              "isActive": true,
              "isChecked": true,
              "status": "Besluit wijziging",
            },
            {
              "datePublished": "",
              "description": "
      <p>U hoeft de Regeling tegemoetkoming meerkosten niet elk jaar opnieuw aan te vragen. De gemeente verlengt de regeling stilzwijgend, maar controleert wel elk jaar of u nog in aanmerking komt.</p>
      <p>U kunt dan ook een brief krijgen met het verzoek om extra informatie te geven.</p>
      <p><a href="https://www.amsterdam.nl/werk-en-inkomen/regelingen-bij-laag-inkomen-pak-je-kans/regelingen-alfabet/extra-geld-als-u-chronisch-ziek-of/">Als er wijzigingen zijn in uw situatie moet u die direct doorgeven</a>.</p>",
              "documents": [
                {
                  "id": "test-encrypted-id",
                  "url": "http://bff-api-host/api/v1/services/v1/stadspas-en-andere-regelingen/document?id=test-encrypted-id",
                },
              ],
              "id": "einde-recht-193359722",
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

  test('transform complete aanvraag only afgewezen', () => {
    const aanvragen = [
      aanvraag(RTM1, AFW, [], {
        id: '5-1',
        datumBesluit: '2026-05-01',
        documenten: [{ id: 'baz' }],
        betrokkenPersonen: [],
        beschiktProductIdentificatie: '7788999',
      }),
    ] as ZorgnedAanvraagWithRelatedPersonsTransformed[];

    const transformed = transformRTMAanvragen(
      'xxxx-session-id-xxxx',
      { bsn: '12345', name: 'Persoon 12345' },
      aanvragen
    );
    expect(transformed).toMatchInlineSnapshot(`
      [
        {
          "betrokkenen": "",
          "dateDecision": "2026-05-01",
          "dateEnd": "",
          "dateRequest": "",
          "dateStart": "",
          "decision": "afgewezen",
          "displayStatus": "Afgewezen",
          "documents": [],
          "id": "522715056",
          "isActual": false,
          "link": {
            "title": "Meer informatie",
            "to": "/regelingen-bij-laag-inkomen/regeling/regeling-tegemoetkoming-meerkosten/522715056",
          },
          "steps": [
            {
              "datePublished": "2026-05-01",
              "description": "<p>Uw aanvraag is afgewezen. Bekijk de brief voor meer informatie hierover.</p>",
              "documents": [
                {
                  "id": "test-encrypted-id",
                  "url": "http://bff-api-host/api/v1/services/v1/stadspas-en-andere-regelingen/document?id=test-encrypted-id",
                },
              ],
              "id": "besluit-193359724",
              "isActive": true,
              "isChecked": true,
              "status": "Besluit",
            },
          ],
          "title": "Regeling tegemoetkoming meerkosten",
        },
      ]
    `);
  });

  test('transform complete FASE2 -> afgewezen', () => {
    const aanvragen = [
      aanvraag(RTM2, AFW, [], {
        id: '6-1',
        datumBesluit: '2026-05-01',
        documenten: [{ id: 'baz' }],
        betrokkenPersonen: [],
        beschiktProductIdentificatie: '7788999',
      }),
    ] as ZorgnedAanvraagWithRelatedPersonsTransformed[];

    const transformed = transformRTMAanvragen(
      'xxxx-session-id-xxxx',
      { bsn: '12345' },
      aanvragen
    );
    expect(transformed).toMatchInlineSnapshot(`
      [
        {
          "betrokkenen": "Met bsn: 12345",
          "dateDecision": "2026-05-01",
          "dateEnd": "",
          "dateRequest": "",
          "dateStart": "2026-05-01",
          "decision": "afgewezen",
          "displayStatus": "Afgewezen",
          "documents": [],
          "id": "658462835",
          "isActual": false,
          "link": {
            "title": "Meer informatie",
            "to": "/regelingen-bij-laag-inkomen/regeling/regeling-tegemoetkoming-meerkosten/658462835",
          },
          "steps": [
            {
              "datePublished": "2026-05-01",
              "description": "<p>
          U krijgt geen Regeling tegemoetkoming meerkosten.
          </p>
          <p>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>
        ",
              "documents": [
                {
                  "id": "test-encrypted-id",
                  "url": "http://bff-api-host/api/v1/services/v1/stadspas-en-andere-regelingen/document?id=test-encrypted-id",
                },
              ],
              "id": "besluit-193359727",
              "isActive": true,
              "isChecked": true,
              "status": "Besluit",
            },
          ],
          "title": "Regeling tegemoetkoming meerkosten",
        },
      ]
    `);
  });

  test('transform complete RTM1 toegewezen -> RTM2 afgewezen', () => {
    const aanvragen = [
      aanvraag(RTM1, TOE, [], {
        id: '7-1',
        datumBesluit: '2026-05-01',
        documenten: [{ id: 'baz' }],
        betrokkenPersonen: [],
        beschiktProductIdentificatie: '7788999',
      }),
      aanvraag(RTM2, AFW, [], {
        id: '7-2',
        datumBesluit: '2026-07-01',
        documenten: [{ id: 'bar' }],
        betrokkenPersonen: [],
        beschiktProductIdentificatie: '887766',
      }),
    ] as ZorgnedAanvraagWithRelatedPersonsTransformed[];

    const transformed = transformRTMAanvragen(
      'xxxx-session-id-xxxx',
      { bsn: '12345' },
      aanvragen
    );
    expect(transformed).toMatchInlineSnapshot(`
      [
        {
          "betrokkenen": "Met bsn: 12345",
          "dateDecision": "2026-07-01",
          "dateEnd": "",
          "dateRequest": "",
          "dateStart": "2026-07-01",
          "decision": "afgewezen",
          "displayStatus": "Afgewezen",
          "documents": [],
          "id": "1103584458",
          "isActual": false,
          "link": {
            "title": "Meer informatie",
            "to": "/regelingen-bij-laag-inkomen/regeling/regeling-tegemoetkoming-meerkosten/1103584458",
          },
          "steps": [
            {
              "datePublished": undefined,
              "description": "",
              "documents": [],
              "id": "aanvraag-193359726",
              "isActive": false,
              "isChecked": true,
              "status": "Aanvraag",
            },
            {
              "datePublished": undefined,
              "description": "<p>Voordat u de Regeling tegemoetkoming meerkosten krijgt, moet u een afspraak maken voor een medische keuring bij de GGD. In de brief staat hoe u dat doet.</p>",
              "documents": [
                {
                  "id": "test-encrypted-id",
                  "url": "http://bff-api-host/api/v1/services/v1/stadspas-en-andere-regelingen/document?id=test-encrypted-id",
                },
              ],
              "id": "in-behandeling-genomen-193359726",
              "isActive": false,
              "isChecked": true,
              "status": "In behandeling genomen",
            },
            {
              "datePublished": "2026-07-01",
              "description": "<p>
          U krijgt geen Regeling tegemoetkoming meerkosten.
          </p>
          <p>In de brief vindt u meer informatie hierover en leest u hoe u bezwaar kunt maken.</p>
        ",
              "documents": [
                {
                  "id": "test-encrypted-id",
                  "url": "http://bff-api-host/api/v1/services/v1/stadspas-en-andere-regelingen/document?id=test-encrypted-id",
                },
              ],
              "id": "besluit-193360813",
              "isActive": true,
              "isChecked": true,
              "status": "Besluit",
            },
          ],
          "title": "Regeling tegemoetkoming meerkosten",
        },
      ]
    `);
  });

  test('removes specificatie documents', () => {
    const aanvragen = [
      aanvraag(RTM2, TOE, [], {
        id: '8-1',
        datumBesluit: '2026-07-01',
        documenten: [
          { id: 'bar', title: RTM_SPECIFICATIE_TITLE },
          { id: 'foo', title: 'Ander document' },
        ],
        betrokkenPersonen: [],
        beschiktProductIdentificatie: '887766',
      }),
    ] as ZorgnedAanvraagWithRelatedPersonsTransformed[];

    const transformed = transformRTMAanvragen(
      'xxxx-session-id-xxxx',
      { bsn: '12345' },
      aanvragen
    );

    const documents = transformed[0].steps[0].documents;
    expect(documents).toHaveLength(1);
    expect(documents?.[0].title).not.toBe(RTM_SPECIFICATIE_TITLE);
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

  test('Collects aanvragen that have the same beschiktProductIdentificatie and adds them to a procesAanvragen array in the first aanvraag', () => {
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
        documenten: ['foo', 'bar'],
        procesAanvragen: [
          {
            beschiktProductIdentificatie: '1',
            documenten: ['baz'],
          },
        ],
      },
      {
        beschiktProductIdentificatie: '2',
        documenten: ['world'],
      },
    ]);
  });
});
