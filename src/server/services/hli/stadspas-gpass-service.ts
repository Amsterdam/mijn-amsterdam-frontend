import memoizee from 'memoizee';

import { fetchAdministratienummer } from './hli-zorgned-service';
import { GPASS_API_TOKEN } from './stadspas-config-and-content';
import {
  SecurityCode,
  Stadspas,
  StadspasAanbiedingSource,
  StadspasBudget,
  StadspasBudgetTransaction,
  StadspasDetailBudgetSource,
  StadspasDetailSource,
  StadspasDiscountTransaction,
  StadspasDiscountTransactions,
  StadspasDiscountTransactionsResponseSource,
  StadspasHouderSource,
  StadspasOwner,
  StadspasPasHouderResponse,
  StadspasTransactieSource,
  StadspasTransactiesResponseSource,
  StadspasTransactionQueryParams,
} from './stadspas-types';
import { HTTP_STATUS_CODES } from '../../../universal/constants/errorCodes';
import {
  apiSuccessResult,
  getSettledResult,
} from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import displayAmount from '../../../universal/helpers/text';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../../config/source-api';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

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
  pashouder: StadspasHouderSource,
  securityCode: SecurityCode
) {
  if (
    typeof gpassStadspasResonseData === 'object' &&
    'pasnummer' in gpassStadspasResonseData
  ) {
    const budgets =
      gpassStadspasResonseData.budgetten?.map(transformBudget) ?? [];

    const balance = budgets.reduce(
      (balance, budget) => balance + budget.budgetBalance,
      0
    );

    const stadspasTransformed: Stadspas = {
      id: String(gpassStadspasResonseData.id),
      owner: getOwner(pashouder),
      dateEnd: gpassStadspasResonseData.expiry_date,
      dateEndFormatted: defaultDateFormat(gpassStadspasResonseData.expiry_date),
      budgets: budgets,
      balance,
      balanceFormatted: `€${displayAmount(balance)}`,
      passNumber: gpassStadspasResonseData.pasnummer,
      passNumberComplete: gpassStadspasResonseData.pasnummer_volledig,
      securityCode,
    };

    return stadspasTransformed;
  }

  return gpassStadspasResonseData;
}

export async function fetchStadspassenByAdministratienummer(
  requestID: RequestID,
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
    if (stadspasHouderResponse.code === HTTP_STATUS_CODES.UNAUTHORIZED) {
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
            transformStadspasResponse(stadspas, pashouder, pas.securitycode),
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
  requestID: RequestID,
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
  maxAge: DEFAULT_API_CACHE_TTL_MS,
});

function transformGpassTransactionsResponse(
  responseSource: StadspasTransactiesResponseSource
) {
  if (Array.isArray(responseSource.transacties)) {
    return responseSource.transacties.map(
      (transactie: StadspasTransactieSource) => {
        const isCredited = transactie.bedrag > 0;
        const displayAmountFormatted = displayAmount(
          Math.abs(transactie.bedrag)
        );
        const amountFormatted = isCredited
          ? `+ €${displayAmountFormatted}`
          : `- €${displayAmountFormatted}`;

        const transaction: StadspasBudgetTransaction = {
          id: String(transactie.id),
          title: transactie.budget.aanbieder.naam,
          amount: transactie.bedrag,
          amountFormatted,
          datePublished: transactie.transactiedatum,
          datePublishedFormatted: defaultDateFormat(transactie.transactiedatum),
          budget: transactie.budget.naam,
          budgetCode: transactie.budget.code,
        };
        return transaction;
      }
    );
  }
  return responseSource;
}

export async function fetchGpassBudgetTransactions(
  requestID: RequestID,
  administratienummer: string,
  pasnummer: Stadspas['passNumber'],
  budgetCode?: StadspasBudget['code']
) {
  const requestParams: StadspasTransactionQueryParams = {
    pasnummer,
    sub_transactions: true,
  };

  if (budgetCode) {
    requestParams.budgetcode = budgetCode;
  }

  const dataRequestConfig = getApiConfig('GPASS', {
    formatUrl: ({ url }) => `${url}/rest/transacties/v1/budget`,
    transformResponse: transformGpassTransactionsResponse,
    headers: getHeaders(administratienummer),
    params: requestParams,
  });

  return requestData<StadspasBudgetTransaction[]>(dataRequestConfig, requestID);
}

function transformGpassAanbiedingenResponse(
  responseSource: StadspasDiscountTransactionsResponseSource
): StadspasDiscountTransactions | StadspasDiscountTransactionsResponseSource {
  if (Array.isArray(responseSource?.transacties)) {
    const discountAmountTotal = responseSource.totale_korting ?? 0;
    return {
      discountAmountTotal,
      discountAmountTotalFormatted: `€${displayAmount(Math.abs(discountAmountTotal))}`,
      transactions: transformTransactions(responseSource.transacties),
    };
  }
  return responseSource;
}

function transformTransactions(
  transactions: StadspasAanbiedingSource[]
): StadspasDiscountTransaction[] {
  return transactions.map((transactie) => ({
    id: String(transactie.id),
    title: transactie.aanbieding.communicatienaam ?? null,
    discountAmount: transactie.verleende_korting,
    discountAmountFormatted: `€${displayAmount(Math.abs(transactie.verleende_korting))}`,
    datePublished: transactie.transactiedatum,
    datePublishedFormatted: defaultDateFormat(transactie.transactiedatum),
    discountTitle: transactie.aanbieding.kortingzin ?? null,
    description: transactie.aanbieding.omschrijving ?? null,
  }));
}

export async function fetchGpassDiscountTransactions(
  requestID: RequestID,
  administratienummer: string,
  pasnummer: Stadspas['passNumber']
) {
  const requestParams: StadspasTransactionQueryParams = {
    pasnummer,
    sub_transactions: true,
  };

  const dataRequestConfig = getApiConfig('GPASS', {
    formatUrl: ({ url }) => `${url}/rest/transacties/v1/aanbiedingen`,
    transformResponse: transformGpassAanbiedingenResponse,
    headers: getHeaders(administratienummer),
    params: requestParams,
  });

  return requestData<StadspasDiscountTransaction[]>(
    dataRequestConfig,
    requestID
  );
}

export const forTesting = {
  transformTransactions,
  transformGpassAanbiedingenResponse,
  transformGpassTransactionsResponse,
  getHeaders,
  getOwner,
  transformBudget,
  transformStadspasResponse,
};
