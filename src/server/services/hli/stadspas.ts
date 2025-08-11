import { HttpStatusCode } from 'axios';
import * as date from 'date-fns';
import { generatePath } from 'react-router';

import { getBudgetNotifications } from './stadspas-config-and-content';
import {
  fetchGpassBudgetTransactions,
  fetchGpassDiscountTransactions,
  fetchStadspassen,
  getActivePassYearDateRange,
  mutateGpassSetPasIsBlockedState,
} from './stadspas-gpass-service';
import {
  StadspasAdministratieNummer,
  StadspasBudget,
  StadspasFrontend,
  type PasblokkadeByPasnummer,
  type StadspasResponseFrontend,
} from './stadspas-types';
import {
  featureToggle,
  routeConfig,
} from '../../../client/pages/Thema/HLI/HLI-thema-config';
import {
  apiErrorResult,
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { decrypt, encrypt } from '../../helpers/encrypt-decrypt';
import { BffEndpoints } from '../../routing/bff-routes';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';
import { captureException } from '../monitoring';

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

  const [, dateEnd] = getActivePassYearDateRange(new Date());
  return apiSuccessResult({
    stadspassen,
    dateExpiryFormatted: defaultDateFormat(dateEnd),
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
  budgetcode?: StadspasBudget['code'],
  verifySessionId?: AuthProfileAndToken['profile']['sid']
) {
  const now = new Date();

  const oneYearAgo = date.subYears(now, 1);
  const [, previousExpiryDate] = getActivePassYearDateRange(oneYearAgo);

  const MONTHS = 6;
  const sixMonthsAgo = date.subMonths(now, MONTHS);
  const dateFrom = date.min([new Date(previousExpiryDate), sixMonthsAgo]);

  return stadspasDecryptAndFetch(
    (administratienummer, pasnummer) =>
      fetchGpassBudgetTransactions(administratienummer, {
        pasnummer,
        budgetcode,
        sub_transactions: true,
        date_from: dateFrom.toISOString().split('T')[0],
        date_until: new Date().toISOString().split('T')[0],
        limit: 20,
        offset: 0,
      }),
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
