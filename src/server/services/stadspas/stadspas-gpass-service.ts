import { apiErrorResult, apiSuccessResult } from '../../../universal/helpers';
import { decrypt, encrypt } from '../../../universal/helpers/encrypt-decrypt';
import { LinkProps } from '../../../universal/types/App.types';
import { getApiConfig } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  StadspasHouderSource,
  StadspasDetailBudgetSource,
  StadspasDetailSource,
  StadspasPasHouderResponse,
  Stadspas,
  StadspasTransactiesResponse,
  StadspasTransactie,
  StadspasTransaction,
} from './stadspas-types';
import { fetchClientNummer } from './stadspas-zorgned-service';

const GPASS_API_TOKEN = process.env.BFF_GPASS_API_TOKEN;
const STADSPAS_TRANSACTIONS_PATH = 'your_transactions_path';
const GPASS_BUDGET_ONLY_FOR_CHILDREN = true;

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
  budget: StadspasDetailBudgetSource,
  administratienummer: string,
  pasnummer: string
) {
  const transactionKeyEncrypted = encrypt(
    `${budget.code}:${administratienummer}:${pasnummer}`
  );
  const urlTransactions = STADSPAS_TRANSACTIONS_PATH + transactionKeyEncrypted;

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
  gpassStadspasResonseData: StadspasDetailSource,
  pashouder: StadspasHouderSource,
  administratienummer: string
) {
  const budgets = gpassStadspasResonseData.budgetten.map((budget) =>
    formatBudget(
      budget,
      administratienummer,
      gpassStadspasResonseData.pasnummer_volledig
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
  const dataRequestConfig = getApiConfig('GPASS');

  const GPASS_ENDPOINT_PAS = `${dataRequestConfig.url}/rest/sales/v1/pas/`;
  const GPASS_ENDPOINT_PASHOUDER = `${dataRequestConfig.url}/rest/sales/v1/pashouder`;

  const administratienummerResponse = await fetchClientNummer(
    requestID,
    authProfileAndToken
  );

  if (administratienummerResponse.status === 'ERROR') {
    return administratienummerResponse;
  }

  const administratienummer = administratienummerResponse.content as string;

  const headers = getHeaders(administratienummer);

  const stadspasHoudersResponse = await requestData<
    StadspasPasHouderResponse[]
  >(
    {
      ...dataRequestConfig,
      url: GPASS_ENDPOINT_PASHOUDER,
      headers,
    },
    requestID,
    authProfileAndToken
  );

  if (stadspasHoudersResponse.status === 'ERROR') {
    if (stadspasHoudersResponse.code === '401') {
      return apiSuccessResult({
        stadspassen: [],
        administratienummer: null,
      });
    }
    return stadspasHoudersResponse;
  }

  const pashouders: StadspasHouderSource[] =
    stadspasHoudersResponse.content?.flatMap((pashouder) => {
      return [pashouder, ...(pashouder.sub_pashouders ?? [])];
    }) ?? [];

  try {
    const stadspasResponses = await Promise.all(
      pashouders.map((pashouder) => {
        return requestData<Stadspas[]>(
          {
            ...dataRequestConfig,
            url: GPASS_ENDPOINT_PAS,
            transformResponse: (stadspas) =>
              transformStadspasResponse(
                stadspas,
                pashouder,
                administratienummer
              ),
            headers,
          },
          requestID,
          authProfileAndToken
        );
      })
    );

    const stadspassen = stadspasResponses
      .map((stadspasResponse) => stadspasResponse.content)
      .flat()
      .filter(
        (stadspas: Stadspas | null): stadspas is Stadspas => stadspas !== null
      );

    return apiSuccessResult({ stadspassen, administratienummer });
  } catch (error: unknown) {
    return apiErrorResult((error as Error).message, null);
  }
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
  const [budgetcode, administratienummer, pasnummer] = decrypt(
    transactionsKeyEncrypted
  ).split(':');

  const dataRequestConfig = getApiConfig('GPASS');
  const GPASS_ENDPOINT_TRANSACTIONS = `${dataRequestConfig.url}/rest/transacties/v1/budget`;

  return requestData<StadspasTransaction[]>(
    {
      ...dataRequestConfig,
      url: GPASS_ENDPOINT_TRANSACTIONS,
      transformResponse: transformGpassTransactionsResponse,
      headers: getHeaders(administratienummer),
      params: {
        pasnummer,
        budgetcode,
        sub_transactions: true,
      },
    },
    requestID,
    authProfileAndToken
  );
}
