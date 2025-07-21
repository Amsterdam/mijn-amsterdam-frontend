import { HttpStatusCode } from 'axios';
import { isAfter, isBefore, isSameDay, parseISO, isValid } from 'date-fns';

import { fetchAdministratienummer } from './hli-zorgned-service';
import {
  DEFAULT_EXPIRY_DAY,
  DEFAULT_EXPIRY_MONTH,
  GPASS_API_TOKEN,
} from './stadspas-config-and-content';
import {
  SecurityCode,
  Stadspas,
  StadspasAanbiedingSource,
  StadspasBudget,
  StadspasBudgetTransaction,
  StadspasDetailBudgetSource,
  StadspasDiscountTransaction,
  StadspasDiscountTransactions,
  StadspasDiscountTransactionsResponseSource,
  StadspasHouderSource,
  StadspasOwner,
  StadspasPasHouderResponse,
  StadspasDetailSource,
  StadspasTransactieSource,
  StadspasTransactiesResponseSource,
  StadspasTransactionQueryParams,
} from './stadspas-types';
import { featureToggle } from '../../../client/pages/Thema/HLI/HLI-thema-config';
import {
  ApiResponse,
  ApiSuccessResponse,
  apiSuccessResult,
  getSettledResult,
  apiErrorResult,
} from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { displayAmount } from '../../../universal/helpers/text';
import { getApiConfig } from '../../helpers/source-api-helpers';
import {
  deleteCacheEntry,
  isSuccessStatus,
  requestData,
} from '../../helpers/source-api-request';
import type { BSN } from '../zorgned/zorgned-types';

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
  securityCode?: SecurityCode
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
      actief: gpassStadspasResonseData.actief,
      securityCode: securityCode ?? null,
    };

    return stadspasTransformed;
  }

  return gpassStadspasResonseData;
}

export async function fetchStadspasSource(
  passNumber: number,
  administratienummer: string,
  enableCache: boolean = true
): Promise<ApiResponse<StadspasDetailSource>> {
  const dataRequestConfig = getApiConfig('GPASS', {
    formatUrl: ({ url }) => `${url}/rest/sales/v1/pas/${passNumber}`,
    headers: getHeaders(administratienummer),
    enableCache,
    params: {
      include_balance: true,
    },
  });
  return requestData<StadspasDetailSource>({
    ...dataRequestConfig,
    // Warning! Setting cacheKey_UNSAFE like this bypasses the transformation by getApiConfigBasedCacheKey in getApiConfig.
    // Only do this if you are absolutely sure you this cacheKey is unique to the user.
    // In this case, the passNumber and administratienummer are unique to the user.
    // NOTE: will not be used if enableCache is false.
    cacheKey_UNSAFE: createStadspasSourceCacheKey(
      passNumber,
      administratienummer
    ),
  });
}

function releaseStadspasSourceCache(
  passNumber: number,
  administratienummer: string
): void {
  const cacheKey = createStadspasSourceCacheKey(
    passNumber,
    administratienummer
  );
  deleteCacheEntry(cacheKey);
}

export function createStadspasSourceCacheKey(
  passNumber: number,
  administratienummer: string
): string {
  return `stadspas-source-${administratienummer}:${passNumber}`;
}

export async function fetchStadspassenByAdministratienummer(
  administratienummer: string
) {
  const headers = getHeaders(administratienummer);
  const dataRequestConfig = getApiConfig('GPASS', {
    formatUrl({ url }) {
      return `${url}/rest/sales/v1/pashouder`;
    },
    validateStatus: (statusCode) =>
      isSuccessStatus(statusCode) ||
      // 401 means there is no record available in the GPASS api for the requested administratienummer.
      statusCode === HttpStatusCode.Unauthorized,
    headers,
    params: {
      addsubs: true,
    },
  });

  const stadspasHouderResponse =
    await requestData<StadspasPasHouderResponse>(dataRequestConfig);

  if (stadspasHouderResponse.status === 'ERROR') {
    return stadspasHouderResponse;
  }

  const pashouderMain = stadspasHouderResponse.content;
  if (!pashouderMain) {
    return NO_PASHOUDER_CONTENT_RESPONSE;
  }

  const allPashouders = [
    pashouderMain,
    ...(pashouderMain.sub_pashouders ?? []),
  ];
  const pasRequests = [];

  for (const pashouder of allPashouders) {
    for (const pas of pashouder.passen ?? []) {
      if (isVisiblePass(pas.actief, pas.expiry_date) && !pas.vervangen) {
        const request = fetchStadspasSource(
          pas.pasnummer,
          administratienummer
        ).then((response) => {
          if (response.content && response.status === 'OK') {
            const pasTransformed = transformStadspasResponse(
              response.content,
              pashouder,
              pas.securitycode
            );
            const stadspas: ApiSuccessResponse<Stadspas> = {
              ...response,
              content: pasTransformed,
            };

            return stadspas;
          }
          return response;
        });

        pasRequests.push(request);
      }
    }
  }

  const stadspasResponses = await Promise.allSettled(pasRequests);
  const stadspassen = stadspasResponses
    .map((stadspasResponse) => getSettledResult(stadspasResponse).content)
    .flat()
    .filter((stadspas) => stadspas !== null);

  return apiSuccessResult({ stadspassen, administratienummer });
}

function getDefaultExpiryDate(addYear: number = 0): Date {
  const thisYearsExpiryDate = new Date(
    `${new Date().getFullYear() + addYear}-${DEFAULT_EXPIRY_MONTH}-${DEFAULT_EXPIRY_DAY}`
  );
  return thisYearsExpiryDate;
}

function getThisYearsDefaultExpiryDate(): Date {
  return getDefaultExpiryDate();
}

function getNextYearsDefaultExpiryDate(): Date {
  return getDefaultExpiryDate(1);
}

export function getPreviousYearsDefaultExpiryDate(): Date {
  return getDefaultExpiryDate(-1);
}

export function getCurrentPasYearExpiryDate(): Date {
  const now = new Date();
  const thisYearsExpiryDate = getThisYearsDefaultExpiryDate();
  const nextYearsExpiryDate = getNextYearsDefaultExpiryDate();
  if (
    isAfter(now, thisYearsExpiryDate) ||
    isSameDay(now, thisYearsExpiryDate)
  ) {
    return nextYearsExpiryDate;
  }
  return thisYearsExpiryDate;
}

function parseExpiryDate(expiryDate: string): Date {
  const parsedDate = parseISO(`${expiryDate.split('T')[0]}T00:00.000Z`);
  return parsedDate;
}

function isVisiblePass(isPasActief: boolean, expiryDate: string): boolean {
  const thisYearsExpiryDate = getThisYearsDefaultExpiryDate();
  const previousYearsExpiryDate = getPreviousYearsDefaultExpiryDate();
  const expiry = parseExpiryDate(expiryDate);

  if (
    // Do not show passes with an invalid expiry date.
    !isValid(expiry) ||
    // Do not show old passes.
    isBefore(expiry, previousYearsExpiryDate) ||
    isSameDay(expiry, previousYearsExpiryDate)
  ) {
    return false;
  }

  if (isAfter(expiry, thisYearsExpiryDate)) {
    // If the pass expires in a future year, we only show it if the pas is active.
    return isPasActief;
  }

  return true;
}

export async function fetchStadspassen(bsn: BSN) {
  const administratienummerResponse = await fetchAdministratienummer(bsn);

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

  return fetchStadspassenByAdministratienummer(administratienummer);
}

function transformGpassTransactionsResponse(
  responseSource: StadspasTransactiesResponseSource
): StadspasBudgetTransaction[] {
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
  return [];
}

/** Fetch budget transactions from gpass
 *
 *  queryParams:
 *    pasnummer:        which pasnummer would you like to query for?
 *    sub_transactions: Include transactions from linked passes.
 *    date_from:        self explanatory.
 *    date_until:       self explanatory.
 *    limit:            How many budget transactions from gpass? Max and default is 20.
 *    offset:           Request n items further plus the limit.
 *                        e.q. 0 will yield items 1 to 20. 1 from 2 to 21 and so on...
 */
export async function fetchGpassBudgetTransactions(
  administratienummer: string,
  queryParams: StadspasTransactionQueryParams
): Promise<ApiResponse<StadspasBudgetTransaction[]>> {
  const DEFAULT_LIMIT = 20;
  const limit = queryParams.limit || DEFAULT_LIMIT;

  const dataRequestConfig = getApiConfig('GPASS', {
    formatUrl: ({ url }) => `${url}/rest/transacties/v1/budget`,
    headers: getHeaders(administratienummer),
    params: queryParams,
  });

  type Response = StadspasTransactiesResponseSource;

  const response = await requestData<Response>(dataRequestConfig);
  if (response.status !== 'OK') {
    return response;
  }

  const totalItems = response.content.total_items;
  if (!(totalItems >= 0)) {
    return apiErrorResult(
      `Total items has non-sensical data. total_items = ${totalItems}`,
      null,
      HttpStatusCode.InternalServerError
    );
  }

  const responses = [];
  const remainingPages = Math.ceil(totalItems / limit);
  for (let pageNumber = 2; pageNumber <= remainingPages; pageNumber++) {
    const response = requestData<Response>(dataRequestConfig);
    responses.push(response);
  }
  const resolvedResponses = await Promise.all(responses);

  const okResponses = [response];
  for (const res of resolvedResponses) {
    if (res.status !== 'OK') {
      return apiErrorResult(
        'One of the requests failed. Try again.',
        null,
        HttpStatusCode.InternalServerError
      );
    }
    okResponses.push(res);
  }

  const finalRespones = okResponses.flatMap((res) =>
    transformGpassTransactionsResponse(res.content)
  );
  return apiSuccessResult(finalRespones);
}

function transformGpassAanbiedingenResponse(
  responseSource: StadspasDiscountTransactionsResponseSource
): StadspasDiscountTransactions | StadspasDiscountTransactionsResponseSource {
  const discountAmountTotal = responseSource.totale_korting ?? 0;
  return {
    discountAmountTotal,
    discountAmountTotalFormatted: `€${displayAmount(Math.abs(discountAmountTotal))}`,
    transactions: Array.isArray(responseSource.transacties)
      ? transformTransactions(responseSource.transacties)
      : [],
  };
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

  return requestData<StadspasDiscountTransaction[]>(dataRequestConfig);
}

type PasBlockedResponse = { isBlocked: boolean };

export async function fetchPasIsBlocked(
  passNumber: number,
  administratienummer: string
): Promise<ApiResponse<PasBlockedResponse>> {
  // Always fetch the latest state of the pass.
  const USE_CACHE = false;

  const passResponse = await fetchStadspasSource(
    passNumber,
    administratienummer,
    USE_CACHE
  );

  if (passResponse.status !== 'OK') {
    return passResponse;
  }

  // The passResponse may give unexpected results so we do extra typechecking on the source input.
  if (typeof passResponse.content?.actief !== 'boolean') {
    return apiErrorResult(
      "Could not determine 'actief' state of pass because of an invalid response",
      null,
      HttpStatusCode.InternalServerError
    );
  }

  return apiSuccessResult(transformPassIsBlockedResponse(passResponse.content));
}

function transformPassIsBlockedResponse(
  pas: StadspasDetailSource
): PasBlockedResponse {
  // If the pass is not active, it is considered blocked.
  const isBlocked = !pas.actief;
  return { isBlocked };
}

export async function mutateGpassSetPasIsBlockedState(
  passNumber: number,
  administratienummer: string,
  isBlocked: boolean
): Promise<ApiResponse<PasBlockedResponse>> {
  const pasIsBlockedResponse = await fetchPasIsBlocked(
    passNumber,
    administratienummer
  );

  if (
    pasIsBlockedResponse.status !== 'OK' ||
    // No need to toggle if the pass is already in the desired state.
    pasIsBlockedResponse.content.isBlocked === isBlocked
  ) {
    return pasIsBlockedResponse;
  }

  // Only toggle the pass if it is currently active.
  const config = getApiConfig('GPASS', {
    method: 'POST',
    formatUrl: ({ url }) => `${url}/rest/sales/v1/togglepas/${passNumber}`,
    headers: getHeaders(administratienummer),
    enableCache: false,
    postponeFetch: !featureToggle.hliThemaStadspasBlokkerenActive,
    transformResponse: transformPassIsBlockedResponse,
  });

  const response = await requestData<PasBlockedResponse>(config);

  if (response.status === 'OK') {
    // If the pass is successfully toggled, we can delete the cache entry.
    // On reload, the pass will be fetched again with the new state.
    releaseStadspasSourceCache(passNumber, administratienummer);
  }

  return response;
}

export const forTesting = {
  getCurrentPasYearExpiryDate,
  getDefaultExpiryDate,
  getHeaders,
  getNextYearsDefaultExpiryDate,
  getOwner,
  getPreviousYearsDefaultExpiryDate,
  getThisYearsDefaultExpiryDate,
  isVisiblePass,
  transformBudget,
  transformGpassAanbiedingenResponse,
  transformGpassTransactionsResponse,
  transformStadspasResponse,
  transformTransactions,
};
