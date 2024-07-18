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
  StadspasBudget,
  StadspasDetailBudgetSource,
  StadspasDetailSource,
  StadspasHouderSource,
  StadspasOwner,
  StadspasPasHouderResponse,
  StadspasTransactieSource,
  StadspasTransactiesResponseSource,
  StadspasTransaction,
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

function formatBudget(
  budget: StadspasDetailBudgetSource,
  administratienummer: string,
  pasnummer: number,
  sessionID?: AuthProfileAndToken['profile']['sid'],
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

  const stadspasBudget: StadspasBudget = {
    title: budget.naam,
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

  return stadspasBudget;
}

function transformStadspasResponse(
  gpassStadspasResonseData: StadspasDetailSource,
  pashouder: StadspasHouderSource,
  administratienummer: string,
  sessionID: AuthProfileAndToken['profile']['sid']
) {
  const budgets = gpassStadspasResonseData.budgetten.map((budget) =>
    formatBudget(
      budget,
      administratienummer,
      gpassStadspasResonseData.pasnummer
      sessionID,
    )
  );

  return {
    id: String(gpassStadspasResonseData.id),
    owner: getOwner(pashouder),
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

export async function fetchStadspassenByAdministratienummer(
  requestID: requestID,
  administratienummer: string,
  sessionID?: AuthProfileAndToken['profile']['sid']
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
            transformStadspasResponse(
              stadspas,
              pashouder,
              administratienummer,
              sessionID
            ),
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
    return noC;
  }

  if (
    administratienummerResponse.status === 'ERROR' ||
    administratienummerResponse.status === 'POSTPONE'
  ) {
    return administratienummerResponse;
  }

  const administratienummer = administratienummerResponse.content as string;

  return fetchStadspassenByAdministratienummer(
    requestID,
    administratienummer,
    authProfileAndToken.profile.sid
  );
}
export const fetchStadspassen = memoizee(fetchStadspassen_, {
  maxAge: 45 * ONE_SECOND_MS,
});

function transformGpassTransactionsResponse(
  gpassTransactionsResponseData: StadspasTransactiesResponseSource
) {
  return gpassTransactionsResponseData.transacties.map(
    (transactie: StadspasTransactieSource) => {
      const transaction: StadspasTransaction = {
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
async function fetchPasBudgetTransactions(
  requestID: requestID,
  administratienummer: string,
  passNumber: Stadspas['passNumber'],
  budgetCode: StadspasBudget['code']
) {
  const requestParams = {
    pasnummer: passNumber,
    budgetcode: budgetCode,
    sub_transactions: true,
  };

  const dataRequestConfig = getApiConfig('GPASS');
  const GPASS_ENDPOINT_TRANSACTIONS = `${dataRequestConfig.url}/rest/transacties/v1/budget`;
  const cfg = {
    ...dataRequestConfig,
    url: GPASS_ENDPOINT_TRANSACTIONS,
    transformResponse: transformGpassTransactionsResponse,
    headers: getHeaders(administratienummer),
    params: requestParams,
  };

  return requestData<StadspasTransaction[]>(cfg, requestID);
}

export async function fetchTransacties(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  transactionsKeysEncrypted: string[]
) {
  const requests = transactionsKeysEncrypted.map((transactionsKeyEncrypted) => {
    let sessionID: string = '';
    let budgetCode: string = '';
    let administratienummer: string = '';
    let passNumber: string = '';

    try {
      [sessionID, budgetCode, administratienummer, passNumber] = decrypt(
        transactionsKeyEncrypted
      ).split(':');
    } catch (error) {
      captureException(error);
    }

    if (
      !administratienummer ||
      !budgetCode ||
      !passNumber ||
      sessionID !== authProfileAndToken.profile.sid
    ) {
      return apiErrorResult('Not authorized', null, 401);
    }

    return fetchPasBudgetTransactions(
      requestID,
      administratienummer,
      passNumber,
      budgetCode
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
