import { HttpStatusCode } from 'axios';
import { isAfter } from 'date-fns';

import { fetchAdministratienummer } from './hli-zorgned-service';
import { GPASS_API_TOKEN } from './stadspas-config-and-content';
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
  PasblokkadeByPasnummer,
} from './stadspas-types';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import {
  ApiResponse_DEPRECATED,
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
  cache,
  isSuccessStatus,
  requestData,
} from '../../helpers/source-api-request';
import { logger } from '../../logging';
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
  administratienummer: string
): Promise<ApiResponse<StadspasDetailSource>> {
  const dataRequestConfig = getApiConfig('GPASS', {
    formatUrl: ({ url }) => `${url}/rest/sales/v1/pas/${passNumber}`,
    headers: getHeaders(administratienummer),
    cacheKey: createStadspasSourceCacheKey(passNumber, administratienummer),
    params: {
      include_balance: true,
    },
  });
  return requestData<StadspasDetailSource>(dataRequestConfig);
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
  const dataRequestConfig = getApiConfig('GPASS');

  const GPASS_ENDPOINT_PASHOUDER = `${dataRequestConfig.url}/rest/sales/v1/pashouder`;

  const headers = getHeaders(administratienummer);
  const stadspasHouderResponse = await requestData<StadspasPasHouderResponse>({
    ...dataRequestConfig,
    url: GPASS_ENDPOINT_PASHOUDER,
    validateStatus: (statusCode) =>
      isSuccessStatus(statusCode) ||
      // 401 means there is no record available in the GPASS api for the requested administratienummer.
      statusCode === HttpStatusCode.Unauthorized,
    headers,
    params: {
      addsubs: true,
    },
  });

  if (stadspasHouderResponse.status === 'ERROR') {
    return stadspasHouderResponse;
  }

  const pashouder = stadspasHouderResponse.content;
  if (!pashouder) {
    return NO_PASHOUDER_CONTENT_RESPONSE;
  }

  const pashouders = [pashouder, ...(pashouder.sub_pashouders ?? [])];
  const pasRequests = [];

  for (const pashouder of pashouders) {
    for (const pas of pashouder.passen ?? []) {
      if (pas.actief || (!pas.vervangen && isCurrentPasYear(pas.expiry_date))) {
        const response = fetchStadspasSource(
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

        pasRequests.push(response);
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

function isCurrentPasYear(expiryDate: string): boolean {
  const pasYearStart = new Date();
  const DEFAULT_EXPIRY_DAY = 31;
  pasYearStart.setDate(DEFAULT_EXPIRY_DAY);
  const DEFAULT_EXPIRY_MONTH = 7;
  pasYearStart.setMonth(DEFAULT_EXPIRY_MONTH);

  const now = new Date();

  if (
    now.getDay() <= DEFAULT_EXPIRY_DAY &&
    now.getMonth() <= DEFAULT_EXPIRY_MONTH
  ) {
    pasYearStart.setFullYear(pasYearStart.getFullYear() - 1);
  }

  return isAfter(expiryDate, pasYearStart);
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

  return requestData<StadspasBudgetTransaction[]>(dataRequestConfig);
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

type PasblokkadeResponse =
  ApiResponse_DEPRECATED<PasblokkadeByPasnummer | null>;

export async function mutateGpassBlockPass(
  passNumber: number,
  administratienummer: string
): Promise<PasblokkadeResponse> {
  return mutateGpassTogglePassChecked(
    passNumber,
    administratienummer,
    (pass) => !pass.actief
  );
}

export async function mutateGpassUnblockPass(
  passNumber: number,
  administratienummer: string
): Promise<PasblokkadeResponse> {
  return mutateGpassTogglePassChecked(
    passNumber,
    administratienummer,
    (pas) => pas.actief
  );
}

async function mutateGpassTogglePass(
  passNumber: number,
  administratienummer: string
): Promise<PasblokkadeResponse> {
  const config = getApiConfig('GPASS', {
    method: 'POST',
    formatUrl: ({ url }) => `${url}/rest/sales/v1/togglepas/${passNumber}`,
    headers: getHeaders(administratienummer),
    enableCache: false,
    postponeFetch: !FeatureToggle.hliThemaStadspasBlokkerenActive,
    transformResponse: transformTogglePassResponse,
  });

  return requestData<PasblokkadeByPasnummer>(config);
}

async function mutateGpassTogglePassChecked(
  passNumber: number,
  administratienummer: string,
  sendMutatingRequestPredicate: (pas: StadspasDetailSource) => boolean
): Promise<PasblokkadeResponse> {
  const cacheKey = createStadspasSourceCacheKey(
    passNumber,
    administratienummer
  );
  if (!cache.del(cacheKey)) {
    logger.warn(
      'Cache free failed for stadspas-source while calling mutateGpassTogglePassChecked'
    );
  }

  const passResponse = await fetchStadspasSource(
    passNumber,
    administratienummer
  );
  if (passResponse.status !== 'OK') {
    return passResponse;
  }

  // This may not give unexpected results so we do extra typechecking on the source input.
  if (typeof passResponse.content?.actief !== 'boolean') {
    return apiErrorResult(
      "Could not determine 'actief' state of pass because of an invalid response",
      null,
      HttpStatusCode.InternalServerError
    );
  }

  if (sendMutatingRequestPredicate(passResponse.content)) {
    return apiSuccessResult(transformTogglePassResponse(passResponse.content));
  }

  return mutateGpassTogglePass(passNumber, administratienummer);
}

function transformTogglePassResponse(
  pas: StadspasDetailSource
): PasblokkadeByPasnummer {
  return { [pas.pasnummer]: pas.actief };
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
