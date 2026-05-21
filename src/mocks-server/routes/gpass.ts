import RESPONSES_PASHOUDERS from '../fixtures/gpass-pashouders.json' with { type: 'json' };
import RESPONSES_STADSPAS from '../fixtures/gpass-stadspas.json' with { type: 'json' };
import RESPONSES_TRANSACTIES from '../fixtures/gpass-transacties.json' with { type: 'json' };
import { MOCK_BASE_PATH } from '../settings.ts';
import type { MockRouteDefinition } from '../types.ts';

type Stadspas = {
  pasnummer: number;
  actief: boolean;
  expiry_date: string;
  vervangen: boolean;
  [key: string]: unknown;
};

type SubPashouder = {
  passen: Stadspas[];
  [key: string]: unknown;
};

function createPas({
  pasnummer = 1234567890,
  actief = true,
  vervangen = false,
  expiry_date = '2090-07-31T21:59:59.000Z',
}: {
  pasnummer?: number;
  actief?: boolean;
  vervangen?: boolean;
  expiry_date?: string;
}): Stadspas {
  return {
    id: `123-${pasnummer}`,
    pasnummer,
    pasnummer_volledig: `60643660${pasnummer}`,
    categorie: 'Minima stadspas',
    categorie_code: 'M',
    actief,
    expiry_date,
    heeft_budget: true,
    vervangen,
    securitycode: '012346',
    passoort: {
      id: 11,
      naam: 'Digitale Stadspas',
    },
    budgetten: RESPONSES_STADSPAS.budgetten,
  };
}

function createSubPashouder({
  id = '03630000316910',
  voornaam = 'Jan',
  passen = [],
}: {
  id?: string;
  voornaam?: string;
  passen?: Stadspas[];
}): SubPashouder {
  const achternaam = `${voornaam}sma`;
  return {
    id,
    voornaam,
    initialen: voornaam[0],
    achternaam,
    volledige_naam: `${voornaam} ${achternaam}`,
    geslacht: 'M',
    geboortedatum: '1979-01-23T00:00:00.000Z',
    heeft_budget: true,
    passen,
  };
}

const thisYear = new Date().getFullYear();
const nextYear = thisYear + 1;
const expiryDateThisYear = `${thisYear}-07-31T00:00:00.000Z`;
const expiryDateNextYear = `${nextYear}-07-31T00:00:00.000Z`;

const pashoudersResponse = {
  ...(RESPONSES_PASHOUDERS as Record<string, unknown>),
  passen: [
    createPas({
      pasnummer: 1234567891,
      expiry_date: expiryDateThisYear,
    }),
    createPas({
      pasnummer: 1234567892,
      expiry_date: expiryDateNextYear,
    }),
    createPas({
      pasnummer: 1234567893,
      actief: false,
      expiry_date: expiryDateThisYear,
    }),
    createPas({
      pasnummer: 1234567894,
      vervangen: true,
      actief: false,
      expiry_date: expiryDateThisYear,
    }),
  ],
  sub_pashouders: [
    createSubPashouder({
      id: '0363077880316910',
      voornaam: 'Mike',
      passen: [
        createPas({
          pasnummer: 1234567895,
          actief: false,
          vervangen: true,
          expiry_date: expiryDateThisYear,
        }),
        createPas({
          pasnummer: 1234567896,
          expiry_date: expiryDateThisYear,
        }),
        createPas({
          pasnummer: 1234567897,
          expiry_date: expiryDateNextYear,
        }),
      ],
    }),
  ],
};

const subPassen = (pashoudersResponse.sub_pashouders as SubPashouder[]).flatMap(
  (pashouder) => pashouder.passen
);
const allPasses = (pashoudersResponse.passen as Stadspas[]).concat(subPassen);

export const routes: MockRouteDefinition[] = [
  {
    id: 'get-gpass-pashouders',
    url: `${MOCK_BASE_PATH}/gpass/rest/sales/v1/pashouder`,
    method: 'GET',
    handler: {
      type: 'json',
      status: 200,
      body: pashoudersResponse,
    },
  },
  {
    id: 'get-gpass-stadspas',
    url: `${MOCK_BASE_PATH}/gpass/rest/sales/v1/pas/:pasnummer`,
    method: 'GET',
    handler: {
      type: 'middleware',
      middleware: (req, res) => {
        const correspondingPashouderPass = allPasses.find(
          (pas) => String(pas.pasnummer) === req.params.pasnummer
        );

        return res.send({
          ...correspondingPashouderPass,
          budgetten: RESPONSES_STADSPAS.budgetten,
        });
      },
    },
  },
  {
    id: 'get-gpass-transacties',
    url: `${MOCK_BASE_PATH}/gpass/rest/transacties/v1/budget`,
    method: 'GET',
    handler: {
      type: 'json',
      status: 200,
      body: RESPONSES_TRANSACTIES,
    },
  },
  {
    id: 'get-gpass-aanbiedingen-transacties',
    url: `${MOCK_BASE_PATH}/gpass/rest/transacties/v1/aanbiedingen`,
    method: 'GET',
    handler: {
      type: 'json',
      status: 200,
      body: [{ toBeDeterminedFields: 'Unknown' }],
    },
  },
  {
    id: 'post-toggle-stadspas',
    url: `${MOCK_BASE_PATH}/gpass/rest/sales/v1/togglepas/:pasnummer`,
    method: 'POST',
    handler: {
      type: 'middleware',
      middleware: (req, res) => {
        const pasnummer = req.params.pasnummer;
        const pas = allPasses.find(
          (pasData) => String(pasData.pasnummer) === pasnummer
        );

        if (pas) {
          pas.actief = !pas.actief;
          pas.expiry_date = new Date().toISOString();
        }

        return res.send({
          ...RESPONSES_STADSPAS,
          pasnummer,
          expiry_date: pas?.expiry_date,
          actief: pas?.actief,
        });
      },
    },
  },
];
