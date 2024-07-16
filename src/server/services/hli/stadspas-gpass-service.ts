import memoizee from 'memoizee';
import {
  apiErrorResult,
  apiSuccessResult,
  getSettledResult,
} from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import displayAmount from '../../../universal/helpers/text';
import { BffEndpoints, getApiConfig, ONE_SECOND_MS } from '../../config';
import { AuthProfileAndToken, generateFullApiUrlBFF } from '../../helpers/app';
import { decrypt, encrypt } from '../../helpers/encrypt-decrypt';
import { requestData } from '../../helpers/source-api-request';
import { captureException } from '../monitoring';
import { fetchAdministratienummer } from './hli-zorgned-service';
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

  const urlTransactions = generateFullApiUrlBFF(
    BffEndpoints.STADSPAS_TRANSACTIONS,
    {
      transactionsKey,
    }
  );

  return {
    description: budget.omschrijving,
    code: budget.code,
    budgetAssigned: budget.budget_assigned,
    budgetAssignedFormatted: `€${displayAmount(budget.budget_assigned)}`,
    budgetBalance: budget.budget_balance,
    budgetBalanceFormatted: `€${displayAmount(budget.budget_balance)}`,
    urlTransactions: urlTransactions,
    transactionsKey,
    dateEnd: budget.expiry_date,
    dateEndFormatted: defaultDateFormat(budget.expiry_date),
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
    dateEndFormatted: defaultDateFormat(gpassStadspasResonseData.expiry_date),
    budgets: budgets,
    balanceFormatted: `€${displayAmount(
      budgets.reduce((balance, budget) => balance + budget.budgetBalance, 0)
    )}`,
    urlTransactions: generateFullApiUrlBFF(BffEndpoints.STADSPAS_TRANSACTIONS),
    passNumber: gpassStadspasResonseData.pasnummer_volledig,
    passType:
      budgets.length && GPASS_BUDGET_ONLY_FOR_CHILDREN ? 'kind' : 'ouder', // TODO: Uitzoeken of we pas kunnen koppelen aan type
  };
}

export async function fetchStadspassen_(
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

  const administratienummerResponse = await fetchAdministratienummer(
    requestID,
    authProfileAndToken
  );

  if (
    administratienummerResponse.status === 'OK' &&
    !administratienummerResponse.content
  ) {
    return noContentResponse;
  }

  if (
    administratienummerResponse.status === 'ERROR' ||
    administratienummerResponse.status === 'POSTPONE'
  ) {
    return administratienummerResponse;
  }

  const administratienummer = administratienummerResponse.content as string;
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
    if (stadspasHouderResponse.code === 401) {
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

export const fetchStadspassen = memoizee(fetchStadspassen_, {
  maxAge: 45 * ONE_SECOND_MS,
});

function transformGpassTransactionsResponse(
  gpassTransactionsResponseData: StadspasTransactiesResponse
) {
  return gpassTransactionsResponseData.transacties.map(
    (transactie: StadspasTransactie) => {
      return {
        id: String(transactie.id),
        title: transactie.budget.aanbieder.naam,
        amount: transactie.bedrag,
        amountFormatted: `- €${displayAmount(Math.abs(transactie.bedrag))}`,
        datePublished: transactie.transactiedatum,
        datePublishedFormatted: defaultDateFormat(transactie.transactiedatum),
      };
    }
  );
}

export async function fetchTransacties(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  transactionsKeysEncrypted: string[]
) {
  const requests = transactionsKeysEncrypted.map((transactionsKeyEncrypted) => {
    let sessionID: string = '';
    let budgetcode: string = '';
    let administratienummer: string = '';
    let pasnummer: string = '';

    try {
      [sessionID, budgetcode, administratienummer, pasnummer] = decrypt(
        transactionsKeyEncrypted
      ).split(':');
    } catch (error) {
      captureException(error);
    }

    if (
      !budgetcode ||
      !administratienummer ||
      !pasnummer ||
      sessionID !== authProfileAndToken.profile.sid
    ) {
      return apiErrorResult('Not authorized', null, 401);
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
  });

  // Only merge transactions of succesful requests
  const allTransactions: StadspasTransaction[] = (
    await Promise.allSettled(requests)
  ).flatMap((result) => {
    const response = getSettledResult(result);
    return response.status === 'OK' ? response.content : [];
  });

  return apiSuccessResult(allTransactions);
}
