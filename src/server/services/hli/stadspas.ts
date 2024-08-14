import { generatePath } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config/routes';
import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { BffEndpoints } from '../../config';
import { AuthProfileAndToken, generateFullApiUrlBFF } from '../../helpers/app';
import { decrypt, encrypt } from '../../helpers/encrypt-decrypt';
import { captureException } from '../monitoring';
import { getBudgetNotifications } from './stadspas-config-and-content';
import {
  fetchStadspasAanbiedingenTransactions,
  fetchStadspasBudgetTransactions,
  fetchStadspassen,
} from './stadspas-gpass-service';
import {
  StadspasBudget,
  StadspasFrontend,
  StadspasBudgetTransaction,
  StadspasAanbiedingenTransactionResponse,
  FetchStadspasTransactionsFn,
} from './stadspas-types';

export async function fetchStadspas(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const stadspasResponse = await fetchStadspassen(
    requestID,
    authProfileAndToken
  );

  if (stadspasResponse.status === 'OK') {
    const stadspassen: StadspasFrontend[] =
      stadspasResponse.content.stadspassen.map((stadspas) => {
        const [transactionsKeyEncrypted] = encrypt(
          `${authProfileAndToken.profile.sid}:${stadspasResponse.content.administratienummer}:${stadspas.passNumber}`
        );

        const urlTransactions = generateFullApiUrlBFF(
          BffEndpoints.STADSPAS_TRANSACTIONS,
          {
            transactionsKeyEncrypted,
          }
        );

        return {
          ...stadspas,
          urlTransactions,
          transactionsKeyEncrypted,
          link: {
            to: generatePath(AppRoutes['HLI/STADSPAS'], {
              id: stadspas.id,
            }),
            title: `Stadspas van ${stadspas.owner.firstname}`,
          },
        };
      });

    return apiSuccessResult(stadspassen);
  }

  return stadspasResponse;
}

export const fetchStadspasBudgetTransactionsWithVerify =
  createTransactionFetchFn<StadspasBudgetTransaction[]>(
    fetchStadspasBudgetTransactions
  );

export const fetchStadspasAanbiedingenTransactionsWithVerify =
  createTransactionFetchFn<StadspasAanbiedingenTransactionResponse>(
    fetchStadspasAanbiedingenTransactions
  );

function createTransactionFetchFn<T>(
  fetchTransactionFn: FetchStadspasTransactionsFn<T>
) {
  async function inner(
    requestID: requestID,
    transactionsKeyEncrypted: string,
    budgetCode?: StadspasBudget['code'],
    verifySessionId?: AuthProfileAndToken['profile']['sid']
  ) {
    let payload: string[];
    try {
      payload = decrypt(transactionsKeyEncrypted).split(':');
    } catch (error) {
      captureException(error);
      return apiErrorResult(
        'Bad request: Failed to decrypt transactions key',
        null,
        400
      );
    }

    let sessionID = '';
    let administratienummer = '';
    let passNumber = '';

    if (verifySessionId) {
      [sessionID, administratienummer, passNumber] = payload;
      if (sessionID !== verifySessionId) {
        return apiErrorResult('Not authorized', null, 401);
      }
    } else {
      [administratienummer, passNumber] = payload;
    }

    if (!administratienummer || !passNumber) {
      return apiErrorResult('Not authorized', null, 401);
    }

    return fetchTransactionFn(
      requestID,
      administratienummer,
      parseInt(passNumber, 10),
      budgetCode
    );
  }
  return inner;
}

export async function fetchStadspasNotifications(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const stadspasResponse = await fetchStadspas(requestID, authProfileAndToken);

  return Array.isArray(stadspasResponse.content)
    ? getBudgetNotifications(stadspasResponse.content)
    : [];
}
