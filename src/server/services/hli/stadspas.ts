import { generatePath } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config/routes';
import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { generateFullApiUrlBFF } from '../../routing/helpers';
import { decrypt, encrypt } from '../../helpers/encrypt-decrypt';
import { BffEndpoints } from '../../routing/bff-routes';
import { captureException } from '../monitoring';
import { getBudgetNotifications } from './stadspas-config-and-content';
import {
  fetchGpassBudgetTransactions,
  fetchGpassDiscountTransactions,
  fetchStadspassen,
} from './stadspas-gpass-service';
import {
  StadspasAdministratieNummer,
  StadspasBudget,
  StadspasFrontend,
} from './stadspas-types';

export async function fetchStadspas(
  requestID: RequestID,
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

async function decryptEncryptedRouteParamAndValidateSessionIDStadspasTransactionsKey(
  transactionsKeyEncrypted: string,
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

  let sessionID: AuthProfileAndToken['profile']['sid'];
  let administratienummer: StadspasAdministratieNummer;
  let pasnummer: string;

  if (verifySessionId) {
    [sessionID, administratienummer, pasnummer] = payload;
    if (sessionID !== verifySessionId) {
      return apiErrorResult('Not authorized', null, 401);
    }
  } else {
    [administratienummer, pasnummer] = payload;
  }

  if (!administratienummer || !pasnummer) {
    return apiErrorResult('Not authorized', null, 401);
  }

  return apiSuccessResult({
    administratienummer,
    pasnummer: parseInt(pasnummer, 10) as StadspasFrontend['passNumber'],
  });
}

async function decryptAndFetch<T>(
  fetchTransactionFn: (
    administratienummer: StadspasAdministratieNummer,
    pasnummer: StadspasFrontend['passNumber']
  ) => T,
  transactionsKeyEncrypted: string,
  verifySessionId?: AuthProfileAndToken['profile']['sid']
) {
  const decryptResult =
    await decryptEncryptedRouteParamAndValidateSessionIDStadspasTransactionsKey(
      transactionsKeyEncrypted,
      verifySessionId
    );

  if (decryptResult.status === 'OK') {
    return fetchTransactionFn(
      decryptResult.content.administratienummer,
      decryptResult.content.pasnummer
    );
  }

  return decryptResult;
}

export async function fetchStadspasDiscountTransactions(
  requestID: RequestID,
  transactionsKeyEncrypted: StadspasFrontend['transactionsKeyEncrypted']
) {
  return decryptAndFetch(
    (administratienummer, pasnummer) =>
      fetchGpassDiscountTransactions(requestID, administratienummer, pasnummer),
    transactionsKeyEncrypted
  );
}

export async function fetchStadspasBudgetTransactions(
  requestID: RequestID,
  transactionsKeyEncrypted: StadspasFrontend['transactionsKeyEncrypted'],
  budgetCode?: StadspasBudget['code'],
  verifySessionId?: AuthProfileAndToken['profile']['sid']
) {
  return decryptAndFetch(
    (administratienummer, pasnummer) =>
      fetchGpassBudgetTransactions(
        requestID,
        administratienummer,
        pasnummer,
        budgetCode
      ),
    transactionsKeyEncrypted,
    verifySessionId
  );
}

export async function fetchStadspasNotifications(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const stadspasResponse = await fetchStadspas(requestID, authProfileAndToken);

  return Array.isArray(stadspasResponse.content)
    ? getBudgetNotifications(stadspasResponse.content)
    : [];
}

export const forTesting = {
  decryptEncryptedRouteParamAndValidateSessionIDStadspasTransactionsKey,
  decryptAndFetch,
};
