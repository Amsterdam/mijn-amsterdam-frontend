import { HttpStatusCode } from 'axios';
import { generatePath } from 'react-router';

import { getBudgetNotifications } from './stadspas-config-and-content.ts';
import {
  fetchGpassBudgetTransactions,
  fetchGpassDiscountTransactions,
  fetchStadspassen,
  getCurrentPasYearExpiryDate,
  mutateGpassSetPasIsBlockedState,
} from './stadspas-gpass-service.ts';
import {
  StadspasAdministratieNummer,
  StadspasBudget,
  StadspasFrontend,
  type PasblokkadeByPasnummer,
  type StadspasResponseFrontend,
} from './stadspas-types.ts';
import {
  featureToggle,
  routeConfig,
} from '../../../client/pages/Thema/HLI/HLI-thema-config.ts';
import {
  apiErrorResult,
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api.ts';
import { defaultDateFormat } from '../../../universal/helpers/date.ts';
import { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { decrypt, encrypt } from '../../helpers/encrypt-decrypt.ts';
import { BffEndpoints } from '../../routing/bff-routes.ts';
import { generateFullApiUrlBFF } from '../../routing/route-helpers.ts';
import { captureException } from '../monitoring.ts';

export async function fetchStadspas(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<StadspasResponseFrontend>> {
  const stadspasResponse = await fetchStadspassen(
    authProfileAndToken.profile.id
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

      const stadspasFrontend: StadspasFrontend = {
        ...stadspas,
        urlTransactions,
        transactionsKeyEncrypted,
        link: {
          to: generatePath(routeConfig.detailPageStadspas.path, {
            passNumber: `${stadspas.passNumber}`,
          }),
          title: `Stadspas van ${stadspas.owner.firstname}`,
        },
      };

      if (featureToggle.hliThemaStadspasBlokkerenActive) {
        stadspasFrontend.blockPassURL = generateFullApiUrlBFF(
          BffEndpoints.STADSPAS_BLOCK_PASS,
          {
            transactionsKeyEncrypted,
          }
        );
      }

      if (featureToggle.hliThemaStadspasDeblokkerenActive) {
        stadspasFrontend.unblockPassURL = generateFullApiUrlBFF(
          BffEndpoints.STADSPAS_UNBLOCK_PASS,
          { transactionsKeyEncrypted }
        );
      }

      return stadspasFrontend;
    });

  return apiSuccessResult({
    stadspassen,
    dateExpiryFormatted: defaultDateFormat(getCurrentPasYearExpiryDate()),
  });
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
  fetchServiceFn: (
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
    return fetchServiceFn(
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
 *  The pass number and administration number are encrypted inside the transactionsKeyEncrypted.
 */
async function blockUnBlockStadspas(
  transactionsKeyEncrypted: string,
  isBlocked: boolean,
  verifySessionId?: AuthProfileAndToken['profile']['sid']
): Promise<ApiResponse<PasblokkadeByPasnummer>> {
  async function fetchFn(administratienummer: string, pasnummer: number) {
    const mutateResponse = await mutateGpassSetPasIsBlockedState(
      pasnummer,
      administratienummer,
      isBlocked
    );

    if (mutateResponse.status !== 'OK') {
      return mutateResponse;
    }

    return apiSuccessResult({
      [`${pasnummer}`]: !!mutateResponse.content?.isBlocked,
    });
  }

  return stadspasDecryptAndFetch(
    fetchFn,
    transactionsKeyEncrypted,
    verifySessionId
  );
}

export async function blockStadspas(
  transactionsKeyEncrypted: string,
  verifySessionId?: AuthProfileAndToken['profile']['sid']
) {
  const IS_BLOCKED = true;

  return blockUnBlockStadspas(
    transactionsKeyEncrypted,
    IS_BLOCKED,
    verifySessionId
  );
}

export async function unblockStadspas(
  transactionsKeyEncrypted: string,
  verifySessionId?: AuthProfileAndToken['profile']['sid']
) {
  const IS_BLOCKED = false;

  return blockUnBlockStadspas(
    transactionsKeyEncrypted,
    IS_BLOCKED,
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
