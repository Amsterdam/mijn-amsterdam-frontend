import { generatePath } from 'react-router-dom';
import {
  apiErrorResult,
  apiSuccessResult,
  getSettledResult,
} from '../../../universal/helpers';
import { decrypt, encrypt } from '../../../universal/helpers/encrypt-decrypt';
import { BFF_BASE_PATH, BffEndpoints, getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  GPASS_API_TOKEN,
  GPASS_BUDGET_ONLY_FOR_CHILDREN,
} from './stadspas-config-and-content';
import {
  Stadspas,
  StadspasDetailBudgetSource,
  StadspasDetailSource,
  StadspasHouderSource,
  StadspasPasHouderResponse,
  StadspasTransactie,
  StadspasTransactiesResponse,
  StadspasTransaction,
} from './stadspas-types';
import { fetchClientNummer } from './stadspas-zorgned-service';

function getHeaders(administratienummer: string) {
  return {
    Authorization: `AppBearer ${GPASS_API_TOKEN},${administratienummer}`,
    Accept: 'application/json',
  };
}

function getOwnerName(pashouder: StadspasHouderSource) {
  return (
    pashouder.volledige_naam ??
    `${pashouder['initialen']} ${pashouder['achternaam']}`
  );
}

function formatBudget(
  sessionID: AuthProfileAndToken['profile']['sid'],
  budget: StadspasDetailBudgetSource,
  administratienummer: string,
  pasnummer: number
) {
  const [transactionsKey] = encrypt(
    `${sessionID}:${budget.code}:${administratienummer}:${pasnummer}`
  );

  const urlTransactions = `${process.env.BFF_OIDC_BASE_URL}${BFF_BASE_PATH}${generatePath(
    BffEndpoints.STADSPAS_TRANSACTIONS,
    {
      transactionsKey,
    }
  )}`;

  return {
    description: budget.omschrijving,
    code: budget.code,
    budgetAssigned: budget.budget_assigned,
    budgetBalance: budget.budget_balance,
    urlTransactions: urlTransactions,
    dateEnd: budget.expiry_date,
  };
}

function transformStadspasResponse(
  sessionID: AuthProfileAndToken['profile']['sid'],
  gpassStadspasResonseData: StadspasDetailSource,
  pashouder: StadspasHouderSource,
  administratienummer: string
) {
  const budgets = gpassStadspasResonseData.budgetten.map((budget) =>
    formatBudget(
      sessionID,
      budget,
      administratienummer,
      gpassStadspasResonseData.pasnummer
    )
  );

  return {
    id: String(gpassStadspasResonseData.id),
    owner: getOwnerName(pashouder),
    dateEnd: gpassStadspasResonseData.expiry_date,
    budgets: budgets,
    passNumber: gpassStadspasResonseData.pasnummer_volledig,
    passType:
      budgets.length && GPASS_BUDGET_ONLY_FOR_CHILDREN ? 'kind' : 'ouder', // TODO: Uitzoeken of we pas kunnen koppelen aan type
  };
}

export async function fetchStadspassen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const noContentResponse = apiSuccessResult({
    stadspassen: [],
    administratienummer: null,
  });

  const dataRequestConfig = getApiConfig('GPASS');

  const GPASS_ENDPOINT_PASHOUDER = `${dataRequestConfig.url}/rest/sales/v1/pashouder`;
  const GPASS_ENDPOINT_PAS = `${dataRequestConfig.url}/rest/sales/v1/pas`;

  const administratienummerResponse = await fetchClientNummer(
    requestID,
    authProfileAndToken
  );

  if (
    administratienummerResponse.status === 'ERROR' &&
    administratienummerResponse.code === '404' // 404 means there is no record available in the ZORGNED api for the requested BSN
  ) {
    return noContentResponse;
  }

  if (
    administratienummerResponse.status === 'ERROR' ||
    administratienummerResponse.status === 'POSTPONE'
  ) {
    return administratienummerResponse;
  }

  const administratienummer = administratienummerResponse.content;

  const headers = getHeaders(administratienummer);

  const stadspasHouderResponse = await requestData<StadspasPasHouderResponse>(
    {
      ...dataRequestConfig,
      url: GPASS_ENDPOINT_PASHOUDER,
      headers,
      params: {
        addsubs: true,
      },
    },
    requestID,
    authProfileAndToken
  );

  if (stadspasHouderResponse.status === 'ERROR') {
    if (stadspasHouderResponse.code === '401') {
      // 401 means there is no record available in the GPASS api for the requested administratienummer
      return noContentResponse;
    }
    return stadspasHouderResponse;
  }

  const pashouder = stadspasHouderResponse.content;
  const pashouders = [
    pashouder,
    ...(stadspasHouderResponse.content?.sub_pashouders?.filter(Boolean) ?? []),
  ].filter(
    (p: StadspasHouderSource | null): p is StadspasHouderSource => p !== null
  );

  const pasRequests = [];

  for (const pashouder of pashouders) {
    for (const pas of pashouder.passen.filter((pas) => pas.actief)) {
      const url = `${GPASS_ENDPOINT_PAS}/${pas.pasnummer}`;
      const request = requestData<Stadspas[]>(
        {
          ...dataRequestConfig,
          url,
          transformResponse: (stadspas) =>
            transformStadspasResponse(
              authProfileAndToken.profile.sid,
              stadspas,
              pashouder,
              administratienummer
            ),
          headers,
          params: {
            include_balance: true,
          },
        },
        requestID,
        authProfileAndToken
      );
      pasRequests.push(request);
    }
  }

  const stadspasResponses = await Promise.allSettled(pasRequests);
  const stadspassen = stadspasResponses
    .map((stadspasResponse) => getSettledResult(stadspasResponse).content)
    .flat()
    .filter(
      (stadspas: Stadspas | null): stadspas is Stadspas => stadspas !== null
    );

  return apiSuccessResult({ stadspassen, administratienummer });
}

function transformGpassTransactionsResponse(
  gpassTransactionsResponseData: StadspasTransactiesResponse
) {
  return gpassTransactionsResponseData.transacties.map(
    (transactie: StadspasTransactie) => {
      return {
        id: String(transactie.id),
        title: transactie.budget.aanbieder.naam,
        amount: transactie.bedrag,
        datePublished: transactie.transactiedatum,
      };
    }
  );
}

export async function fetchTransacties(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  transactionsKeyEncrypted: string
) {
  const [sessionID, budgetcode, administratienummer, pasnummer] = decrypt(
    transactionsKeyEncrypted
  ).split(':');

  if (sessionID !== authProfileAndToken.profile.sid) {
    return apiErrorResult('Not authorized', null, 403);
  }

  const dataRequestConfig = getApiConfig('GPASS');
  const GPASS_ENDPOINT_TRANSACTIONS = `${dataRequestConfig.url}/rest/transacties/v1/budget`;
  const cfg = {
    ...dataRequestConfig,
    url: GPASS_ENDPOINT_TRANSACTIONS,
    transformResponse: transformGpassTransactionsResponse,
    headers: getHeaders(administratienummer),
    params: {
      pasnummer,
      budgetcode,
      sub_transactions: true,
    },
  };

  return requestData<StadspasTransaction[]>(
    cfg,
    requestID,
    authProfileAndToken
  );
}
