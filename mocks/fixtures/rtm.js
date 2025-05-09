const fs = require('fs');
const path = require('path');

const config = [
  // scenario 1: fase 1 toegewezen
  [
    {
      identificatie: 'AV-RTM1',
      resultaat: 'toegewezen',
      relaties: [],
    },
  ],
  // scenario 1.b: fase 1 afgewezen
  [
    {
      identificatie: 'AV-RTM1',
      resultaat: 'afgewezen',
      relaties: [],
    },
  ],
  // scenario 2: fase 1 toegewezen & fase 2 afgewezen
  [
    {
      identificatie: 'AV-RTM1',
      resultaat: 'toegewezen',
      relaties: [],
    },
    {
      identificatie: 'AV-RTM',
      resultaat: 'afgewezen',
      relaties: [],
    },
  ],
  // scenario 3: fase 1 toegewezen & fase 2 toegewezen
  [
    {
      identificatie: 'AV-RTM1',
      resultaat: 'toegewezen',
      relaties: [],
    },
    {
      identificatie: 'AV-RTM',
      resultaat: 'toegewezen',
      relaties: [],
    },
  ],
  //scenario 1: fase 1 toegewezen
  [
    {
      identificatie: 'AV-RTM1',
      resultaat: 'toegewezen',
      relaties: [
        { resultaat: 'toegewezen', relatie: 'kind' },
        { resultaat: 'toegewezen', relatie: 'partner' },
      ],
    },
  ],
  // scenario 2: fase 1 toegewezen & fase 2 afgewezen
  [
    {
      identificatie: 'AV-RTM1',
      resultaat: 'toegewezen',
      relaties: [
        { resultaat: 'toegewezen', relatie: 'kind' },
        { resultaat: 'toegewezen', relatie: 'partner' },
      ],
    },
    {
      identificatie: 'AV-RTM',
      resultaat: 'afgewezen',
      relaties: [
        { resultaat: 'afgewezen', relatie: 'kind' },
        { resultaat: 'afgewezen', relatie: 'partner' },
      ],
    },
  ],
  // scenario 3: fase 1 toegewezen & fase 2 afgewezen aanvrager & toegewezen kind/ partner (of andere combi ivm teksten)
  [
    {
      identificatie: 'AV-RTM1',
      resultaat: 'toegewezen',
      relaties: [
        { resultaat: 'toegewezen', relatie: 'kind' },
        { resultaat: 'toegewezen', relatie: 'partner' },
      ],
    },
    {
      identificatie: 'AV-RTM',
      resultaat: 'afgewezen',
      relaties: [
        { resultaat: 'toegewezen', relatie: 'kind' },
        { resultaat: 'toegewezen', relatie: 'partner' },
      ],
    },
  ],
  [
    {
      identificatie: 'AV-RTM1',
      resultaat: 'toegewezen',
      relaties: [
        { resultaat: 'toegewezen', relatie: 'kind' },
        { resultaat: 'toegewezen', relatie: 'partner' },
      ],
    },
    {
      identificatie: 'AV-RTM',
      resultaat: 'toegewezen',
      relaties: [
        { resultaat: 'toegewezen', relatie: 'kind' },
        { resultaat: 'toegewezen', relatie: 'partner' },
      ],
    },
  ],
  // scenario 4: fase 1 toegewezen & fase 2 toegewezen aanvrager & afgewezen partner
  [
    {
      identificatie: 'AV-RTM1',
      resultaat: 'toegewezen',
      relaties: [{ resultaat: 'toegewezen', relatie: 'partner' }],
    },
    {
      identificatie: 'AV-RTM',
      resultaat: 'toegewezen',
      relaties: [{ resultaat: 'afgewezen', relatie: 'partner' }],
    },
  ],
  // scenario 5: fase 1 toegewezen & fase 2 toegewezen + kind dat 18 jaar wordt (einde recht)
  [
    {
      identificatie: 'AV-RTM1',
      resultaat: 'toegewezen',
      relaties: [
        { resultaat: 'toegewezen', relatie: 'kind' },
        { resultaat: 'toegewezen', relatie: 'partner' },
      ],
    },
    {
      identificatie: 'AV-RTM',
      resultaat: 'toegewezen',
      relaties: [
        { resultaat: 'toegewezen', relatie: 'kind', leeftijd: 17 },
        { resultaat: 'toegewezen', relatie: 'partner' },
      ],
    },
  ],
];

// Agewezen
const a = {
  identificatie: 'rtm-1',
  datumAanvraag: '2025-05-09',
  beschikking: {
    datumAfgifte: '2025-05-17',
    beschikteProducten: [
      {
        product: {
          identificatie: 'AV-IIT',
          productsoortCode: 'AV-ALG',
          omschrijving: 'Tegemoetkoming meerkosten',
        },
        resultaat: 'toegewezen',
        toegewezenProduct: {
          datumIngangGeldigheid: '2025-06-01',
          datumEindeGeldigheid: '2026-06-01',
          actueel: true,
          toewijzingen: [],
          betrokkenen: ['123123'],
        },
      },
    ],
  },
  documenten: [
    {
      documentidentificatie: 'B2806770',
      omschrijving: 'AV-IIT Toekenning',
      omschrijvingclientportaal: 'AV-IIT Toekenning',
      datumDefinitief: '2025-05-29T11:15:35.287',
    },
  ],
};

const voorzieningen = [];

function createVoorziening(rel, id, resultaat, code, betrokkenen) {
  const voorziening = structuredClone(a);

  voorziening.identificatie = `${code}-${id}`;

  const beschiktProduct = voorziening.beschikking.beschikteProducten[0];
  beschiktProduct.resultaat = resultaat;
  beschiktProduct.product.identificatie = code;

  if (resultaat === 'toegewezen') {
    beschiktProduct.product.omschrijving = `Tegemoetkoming meerkosten ${rel} ${id}`;
  } else {
    beschiktProduct.product.omschrijving = `Tegemoetkoming meerkosten ${rel} ${id} - afgewezen`;
  }

  beschiktProduct.toegewezenProduct.actueel = resultaat === 'toegewezen';

  beschiktProduct.toegewezenProduct.betrokkenen = betrokkenen.map(
    (betrokkene, index) => {
      return `${betrokkene.relatie}-${index + 1}`;
    }
  );

  voorziening.documenten = [
    {
      documentidentificatie: `${code}-${id}`,
      omschrijving: `${code} - ${resultaat}`,
      omschrijvingclientportaal: `${code} - ${resultaat}`,
      datumDefinitief: '2025-05-29T11:15:35.287',
    },
  ];

  return voorziening;
}

config.forEach((scenarios, index) => {
  scenarios.forEach((scenario, index2) => {
    const { resultaat, relaties, identificatie } = scenario;
    const id = `${index + 1}.${index2 + 1}`;

    voorzieningen.push(
      createVoorziening(
        id,
        'aanvrager',
        resultaat,
        scenario.identificatie,
        scenario.relaties
      )
    );

    if (identificatie === 'AV-RTM') {
      relaties.forEach((relatie, index3) => {
        const { resultaat, relatie: rel, leeftijd } = relatie;
        const id2 = `${id}.${index3 + 1}`;
        voorzieningen.push(
          createVoorziening(id2, rel, resultaat, scenario.identificatie, [])
        );
      });
    }
  });
});

fs.writeFileSync(
  path.join(__dirname, 'zorgned-av-aanvragen-rtm.json'),
  JSON.stringify(
    {
      _embedded: {
        aanvraag: voorzieningen,
      },
    },
    null,
    2
  ),
  'utf-8'
);
console.log('RTM fixtures generated successfully.');
