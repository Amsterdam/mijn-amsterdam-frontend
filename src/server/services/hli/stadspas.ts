import { HttpStatusCode } from 'axios';
import { generatePath } from 'react-router';

import { getBudgetNotifications } from './stadspas-config-and-content';
import {
  mutateGpassBlockPass,
  fetchGpassBudgetTransactions,
  fetchGpassDiscountTransactions,
  fetchStadspassen,
  mutateGpassUnblockPass,
} from './stadspas-gpass-service';
import {
  StadspasAdministratieNummer,
  StadspasBudget,
  StadspasFrontend,
} from './stadspas-types';
import { routeConfig } from '../../../client/pages/Thema/HLI/HLI-thema-config';
import {
  apiErrorResult,
  ApiResponse_DEPRECATED,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { decrypt, encrypt } from '../../helpers/encrypt-decrypt';
import { BffEndpoints } from '../../routing/bff-routes';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import { captureException } from '../monitoring';

export async function fetchStadspas(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse_DEPRECATED<StadspasFrontend[] | null>> {
  const stadspasResponse = await fetchStadspassen(authProfileAndToken);

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

      const stadspasFrontend: StadspasFrontend = {
        ...stadspas,
        urlTransactions,
        transactionsKeyEncrypted,
        blockPassURL: generateFullApiUrlBFF(BffEndpoints.STADSPAS_BLOCK_PASS, {
          transactionsKeyEncrypted,
        }),
        unblockPassURL: generateFullApiUrlBFF(
          BffEndpoints.STADSPAS_UNBLOCK_PASS,
          { transactionsKeyEncrypted }
        ),
        link: {
          to: generatePath(routeConfig.detailPageStadspas.path, {
            passNumber: `${stadspas.passNumber}`,
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
      HttpStatusCode.BadRequest
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
        HttpStatusCode.Unauthorized
      );
    }
  } else {
    [administratienummer, pasnummer] = payload;
  }

  if (!administratienummer || !pasnummer) {
    return apiErrorResult('Not authorized', null, HttpStatusCode.Unauthorized);
  }

  return apiSuccessResult({
    administratienummer,
    pasnummer: parseInt(pasnummer, 10) as StadspasFrontend['passNumber'],
  });
}

export async function stadspasDecryptAndFetch<T>(
  fetchTransactionFn: (
    administratienummer: StadspasAdministratieNummer,
    pasnummer: StadspasFrontend['passNumber']
  ) => T,
  transactionsKeyEncrypted: string,
  sessionId?: AuthProfileAndToken['profile']['sid']
) {
  const decryptResult =
    await decryptEncryptedRouteParamAndValidateSessionIDStadspasTransactionsKey(
      transactionsKeyEncrypted,
      sessionId
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
  transactionsKeyEncrypted: StadspasFrontend['transactionsKeyEncrypted']
) {
  return stadspasDecryptAndFetch(
    (administratienummer, pasnummer) =>
      fetchGpassDiscountTransactions(administratienummer, pasnummer),
    transactionsKeyEncrypted
  );
}

export async function fetchStadspasBudgetTransactions(
  transactionsKeyEncrypted: StadspasFrontend['transactionsKeyEncrypted'],
  budgetCode?: StadspasBudget['code'],
  verifySessionId?: AuthProfileAndToken['profile']['sid']
) {
  return stadspasDecryptAndFetch(
    (administratienummer, pasnummer) =>
      fetchGpassBudgetTransactions(administratienummer, pasnummer, budgetCode),
    transactionsKeyEncrypted,
    verifySessionId
  );
}

/** Block a stadspas with it's passNumber.
 *
 *  The passNumber is encrypted inside the transactionsKeyEncrypted.
 *  The endpoint in use can also unblock cards, but we prevent this so its block only.
 */
export async function blockStadspas(
  transactionsKeyEncrypted: string,
  verifySessionId?: AuthProfileAndToken['profile']['sid']
) {
  return stadspasDecryptAndFetch(
    (administratienummer, pasnummer) => {
      return mutateGpassBlockPass(pasnummer, administratienummer);
    },
    transactionsKeyEncrypted,
    verifySessionId
  );
}

export async function unblockStadspas(
  transactionsKeyEncrypted: string,
  verifySessionId?: AuthProfileAndToken['profile']['sid']
) {
  return stadspasDecryptAndFetch(
    (administratienummer, pasnummer) => {
      return mutateGpassUnblockPass(pasnummer, administratienummer);
    },
    transactionsKeyEncrypted,
    verifySessionId
  );
}

export async function fetchStadspasNotifications(
  authProfileAndToken: AuthProfileAndToken
) {
  const stadspasResponse = await fetchStadspas(authProfileAndToken);

  return Array.isArray(stadspasResponse.content)
    ? getBudgetNotifications(stadspasResponse.content)
    : [];
}

export const forTesting = {
  decryptEncryptedRouteParamAndValidateSessionIDStadspasTransactionsKey,
  decryptAndFetch: stadspasDecryptAndFetch,
};
