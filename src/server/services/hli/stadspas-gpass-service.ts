import memoizee from 'memoizee';
import {
  apiSuccessResult,
  getSettledResult,
} from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import displayAmount from '../../../universal/helpers/text';
import { getApiConfig, ONE_SECOND_MS } from '../../config';
import { AuthProfileAndToken } from '../../helpers/app';
import { requestData } from '../../helpers/source-api-request';
import { fetchAdministratienummer } from './hli-zorgned-service';
import { GPASS_API_TOKEN } from './stadspas-config-and-content';
import {
  Stadspas,
  StadspasBudget,
  StadspasDetailBudgetSource,
  StadspasDetailSource,
  StadspasHouderSource,
  StadspasOwner,
  StadspasPasHouderResponse,
  StadspasTransactieSource,
  StadspasTransactiesResponseSource,
  StadspasBudgetTransaction,
  StadspasTransactionQueryParams,
  StadspasAanbiedingenTransactionResponse,
} from './stadspas-types';

const NO_PASHOUDER_CONTENT_RESPONSE = apiSuccessResult({
  stadspassen: [],
  administratienummer: null,
});

function getHeaders(administratienummer: string) {
  return {
    Authorization: `AppBearer ${GPASS_API_TOKEN},${administratienummer}`,
    Accept: 'application/json',
  };
}

function getOwner(pashouder: StadspasHouderSource): StadspasOwner {
  return {
    firstname: pashouder.voornaam,
    lastname: pashouder.achternaam,
    infix: pashouder.tussenvoegsel,
    initials: pashouder.initialen,
  };
}

function transformBudget(budget: StadspasDetailBudgetSource) {
  if (typeof budget === 'object' && 'naam' in budget) {
    const stadspasBudget: StadspasBudget = {
      title: budget.naam,
      description: budget.omschrijving ?? '',
      code: budget.code,
      budgetAssigned: budget.budget_assigned,
      budgetAssignedFormatted: `€${displayAmount(budget.budget_assigned)}`,
      budgetBalance: budget.budget_balance,
      budgetBalanceFormatted: `€${displayAmount(budget.budget_balance)}`,
      dateEnd: budget.expiry_date,
      dateEndFormatted: defaultDateFormat(budget.expiry_date),
    };

    return stadspasBudget;
  }
  return budget;
}

function transformStadspasResponse(
  gpassStadspasResonseData: StadspasDetailSource,
  pashouder: StadspasHouderSource
) {
  if (
    typeof gpassStadspasResonseData === 'object' &&
    'pasnummer' in gpassStadspasResonseData
  ) {
    const budgets =
      gpassStadspasResonseData.budgetten?.map(transformBudget) ?? [];

    const stadspasTransformed: Stadspas = {
      id: String(gpassStadspasResonseData.id),
      owner: getOwner(pashouder),
      dateEnd: gpassStadspasResonseData.expiry_date,
      dateEndFormatted: defaultDateFormat(gpassStadspasResonseData.expiry_date),
      budgets: budgets,
      balanceFormatted: `€${displayAmount(
        budgets.reduce((balance, budget) => balance + budget.budgetBalance, 0)
      )}`,
      passNumber: gpassStadspasResonseData.pasnummer,
      passNumberComplete: gpassStadspasResonseData.pasnummer_volledig,
    };

    return stadspasTransformed;
  }

  return gpassStadspasResonseData;
}

export async function fetchStadspassenByAdministratienummer(
  requestID: requestID,
  administratienummer: string
) {
  const dataRequestConfig = getApiConfig('GPASS');

  const GPASS_ENDPOINT_PASHOUDER = `${dataRequestConfig.url}/rest/sales/v1/pashouder`;
  const GPASS_ENDPOINT_PAS = `${dataRequestConfig.url}/rest/sales/v1/pas`;

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
    requestID
  );

  if (stadspasHouderResponse.status === 'ERROR') {
    if (stadspasHouderResponse.code === 401) {
      // 401 means there is no record available in the GPASS api for the requested administratienummer
      return NO_PASHOUDER_CONTENT_RESPONSE;
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
            transformStadspasResponse(stadspas, pashouder),
          headers,
          params: {
            include_balance: true,
          },
        },
        requestID
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

export async function fetchStadspassen_(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const administratienummerResponse = await fetchAdministratienummer(
    requestID,
    authProfileAndToken
  );

  if (
    administratienummerResponse.status === 'OK' &&
    !administratienummerResponse.content
  ) {
    return NO_PASHOUDER_CONTENT_RESPONSE;
  }

  if (
    administratienummerResponse.status === 'ERROR' ||
    administratienummerResponse.status === 'POSTPONE'
  ) {
    return administratienummerResponse;
  }

  const administratienummer = administratienummerResponse.content as string;

  return fetchStadspassenByAdministratienummer(requestID, administratienummer);
}
export const fetchStadspassen = memoizee(fetchStadspassen_, {
  maxAge: 45 * ONE_SECOND_MS,
});

function transformGpassTransactionsResponse(
  gpassTransactionsResponseData: StadspasTransactiesResponseSource
) {
  if (Array.isArray(gpassTransactionsResponseData.transacties)) {
    return gpassTransactionsResponseData.transacties.map(
      (transactie: StadspasTransactieSource) => {
        const transaction: StadspasBudgetTransaction = {
          id: String(transactie.id),
          title: transactie.budget.aanbieder.naam,
          amount: transactie.bedrag,
          amountFormatted: `- €${displayAmount(Math.abs(transactie.bedrag))}`,
          datePublished: transactie.transactiedatum,
          datePublishedFormatted: defaultDateFormat(transactie.transactiedatum),
          budget: transactie.budget.naam,
          budgetCode: transactie.budget.code,
        };
        return transaction;
      }
    );
  }
  return gpassTransactionsResponseData;
}

export async function fetchStadspasAanbiedingenTransactions(
  requestID: requestID,
  administratienummer: string,
  passNumber: Stadspas['passNumber']
) {
  const requestParams: StadspasTransactionQueryParams = {
    pasnummer: passNumber,
    sub_transactions: true,
  };

  const dataRequestConfig = getApiConfig('GPASS', {
    formatUrl: ({ url }) => `${url}/rest/transacties/v1/aanbiedingen`,
    headers: getHeaders(administratienummer),
    params: requestParams,
  });

  return requestData<StadspasAanbiedingenTransactionResponse>(
    dataRequestConfig,
    requestID
  );
}

export async function fetchStadspasBudgetTransactions(
  requestID: requestID,
  administratienummer: string,
  passNumber: Stadspas['passNumber'],
  budgetCode?: StadspasBudget['code']
) {
  const requestParams: StadspasTransactionQueryParams = {
    pasnummer: passNumber,
    sub_transactions: true,
  };

  if (budgetCode) {
    requestParams.budgetCode = budgetCode;
  }

  const dataRequestConfig = getApiConfig('GPASS', {
    formatUrl: ({ url }) => `${url}/rest/transacties/v1/budget`,
    transformResponse: transformGpassTransactionsResponse,
    headers: getHeaders(administratienummer),
    params: requestParams,
  });

  return requestData<StadspasBudgetTransaction[]>(dataRequestConfig, requestID);
}
