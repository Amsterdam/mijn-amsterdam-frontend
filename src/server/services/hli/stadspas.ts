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
  fetchPasBudgetTransactions,
  fetchStadspassen,
} from './stadspas-gpass-service';
import { StadspasBudget, StadspasFrontend } from './stadspas-types';

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

export async function fetchStadspasTransactions(
  requestID: requestID,
  transactionsKeyEncrypted: string,
  budgetCode?: StadspasBudget['code'],
  verifySessionId?: AuthProfileAndToken['profile']['sid']
) {
  let sessionID: string = '';
  let administratienummer: string = '';
  let passNumber: string = '';

  try {
    const payload = decrypt(transactionsKeyEncrypted).split(':');

    console.log('payload', payload);

    if (verifySessionId) {
      [sessionID, administratienummer, passNumber] = payload;
    } else {
      [administratienummer, passNumber] = payload;
    }
  } catch (error) {
    captureException(error);
  }

  if (
    !administratienummer ||
    !passNumber ||
    (verifySessionId && sessionID !== verifySessionId)
  ) {
    return apiErrorResult('Not authorized', null, 401);
  }

  return fetchPasBudgetTransactions(
    requestID,
    administratienummer,
    passNumber,
    budgetCode
  );
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
