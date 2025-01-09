import { generatePath } from 'react-router-dom';

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
import { AppRoutes } from '../../../universal/config/routes';
import { HTTP_STATUS_CODES } from '../../../universal/constants/errorCodes';
import {
  apiErrorResult,
  ApiResponse,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { decrypt, encrypt } from '../../helpers/encrypt-decrypt';
import { BffEndpoints } from '../../routing/bff-routes';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import { captureException } from '../monitoring';

export async function fetchStadspas(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<StadspasFrontend[]>> {
  const stadspasResponse = await fetchStadspassen(
    requestID,
    authProfileAndToken
  );

  if (stadspasResponse.status !== 'OK') {
    return stadspasResponse;
  }

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

      let blockPassURL = null;
      if (stadspas.actief) {
        // Encrypt so we cannot see in our logging which pass was blocked.
        const [encrypted] = encrypt(stadspas.passNumber.toString());
        blockPassURL = generateFullApiUrlBFF(BffEndpoints.STADSPAS_BLOCK_PASS, {
          passNumber: encrypted,
        });
      }

      const stadspasFrontend: StadspasFrontend = {
        ...stadspas,
        urlTransactions,
        transactionsKeyEncrypted,
        blockPassURL,
        link: {
          to: generatePath(AppRoutes['HLI/STADSPAS'], {
            id: stadspas.id,
          }),
          title: `Stadspas van ${stadspas.owner.firstname}`,
        },
      };
      return stadspasFrontend;
    });

  return apiSuccessResult(stadspassen);
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
      HTTP_STATUS_CODES.BAD_REQUEST
    );
  }

  let sessionID: SessionID;
  let administratienummer: StadspasAdministratieNummer;
  let pasnummer: string;

  if (verifySessionId) {
    [sessionID, administratienummer, pasnummer] = payload;
    if (sessionID !== verifySessionId) {
      return apiErrorResult(
        'Not authorized',
        null,
        HTTP_STATUS_CODES.UNAUTHORIZED
      );
    }
  } else {
    [administratienummer, pasnummer] = payload;
  }

  if (!administratienummer || !pasnummer) {
    return apiErrorResult(
      'Not authorized',
      null,
      HTTP_STATUS_CODES.UNAUTHORIZED
    );
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
