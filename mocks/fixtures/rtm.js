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

function createVoorziening(
  datumAfgifte,
  rel,
  id,
  resultaat,
  identificatie,
  deel,
  betrokkenen
) {
  const voorziening = structuredClone(a);

  voorziening.identificatie = `${deel}-${id}`;
  voorziening.beschikking.datumAfgifte = datumAfgifte;
  voorziening.beschikking.beschikkingNummer = id;

  const beschiktProduct = voorziening.beschikking.beschikteProducten[0];

  beschiktProduct.resultaat = resultaat;
  beschiktProduct.product.identificatie = identificatie;
  beschiktProduct.product.omschrijving = `Tegemoetkoming meerkosten ${rel}${betrokkenen.length ? ` [+${betrokkenen.length}]` : ''} ${id} - ${resultaat}`;
  beschiktProduct.toegewezenProduct.actueel = resultaat === 'toegewezen';

  const datum = new Date(datumAfgifte);
  const day = `${datum.getDate() + 1}`.padStart(2, '0');
  const month = `${datum.getMonth() + 2}`.padStart(2, '0');
  const year = datum.getFullYear() + 1;

  beschiktProduct.toegewezenProduct.datumIngangGeldigheid = `2025-${month}-${day}`;
  beschiktProduct.toegewezenProduct.datumEindeGeldigheid = `${year}-${month}-${day}`;

  beschiktProduct.toegewezenProduct.betrokkenen = betrokkenen.map(
    (betrokkene, index) => {
      return `${betrokkene.relatie}-${index + 1}`;
    }
  );

  voorziening.documenten = [
    {
      documentidentificatie: `${identificatie}-${id}`,
      omschrijving: `${identificatie} - ${resultaat}`,
      omschrijvingclientportaal: `${identificatie} - ${resultaat}`,
      datumDefinitief: '2025-05-29T11:15:35.287',
    },
  ];

  return voorziening;
}

config.forEach((scenarios, index) => {
  scenarios.forEach((scenario, index2) => {
    const { resultaat, relaties, identificatie } = scenario;
    const deel = identificatie === 'AV-RTM1' ? 'deel1' : 'deel2';
    const id = `${deel}-${index + 1}.${index2 + 1}`;

    voorzieningen.push(
      createVoorziening(
        `2025-05-${`${index + 1}`.padStart(2, '0')}`,
        'aanvrager',
        id,
        resultaat,
        identificatie,
        deel,
        deel === 'deel1' ? relaties : []
      )
    );

    if (deel === 'deel2') {
      relaties.forEach((relatie, index3) => {
        const { resultaat, relatie: rel, leeftijd } = relatie;
        const id2 = `${id}.${index3 + 1}`;
        voorzieningen.push(
          createVoorziening(
            `2025-05-${`${index + 1}`.padStart(2, '0')}`,
            rel,
            id2,
            resultaat,
            identificatie,
            deel,
            []
          )
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
