import memoizee from 'memoizee';
import qs from 'qs';

import { getAfisApiConfig } from './afis-helpers';
import {
  AfisBusinessPartnerCommercialResponseSource,
  AfisBusinessPartnerKnownResponse,
  AfisBusinessPartnerPrivateResponseSource,
} from './afis-types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { ONE_MINUTE_MS } from '../../config/app';
import { DataRequestConfig } from '../../config/source-api';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

const AFIS_TOKEN_REQUEST_ID = 'AFIS-TOKEN-REQUEST-ID';

async function fetchAfisTokenHeader_() {
  const additionalConfig: DataRequestConfig = {
    method: 'post',
    data: qs.stringify({
      client_id: getFromEnv('BFF_AFIS_CLIENT_ID'),
      client_secret: getFromEnv('BFF_AFIS_CLIENT_SECRET'),
      grant_type: 'client_credentials',
    }),
    transformResponse: (response: {
      access_token: string;
      token_type: string;
    }) => {
      if (response?.access_token) {
        return {
          Authorization: `${response.token_type} ${response.access_token}`,
        };
      }
      return null;
    },
    formatUrl(config) {
      return `${config.url}/OAuthServer`;
    },
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  };

  const dataRequestConfig = getApiConfig('AFIS', additionalConfig);

  const tokenHeaderResponse = await requestData<{
    Authorization: string;
  } | null>(dataRequestConfig, AFIS_TOKEN_REQUEST_ID);

  return tokenHeaderResponse.content;
}

// The token is validity is 1 hour, to be on the safe side we release the memoized token after 55 minutes before fetching again.
export const fetchAfisTokenHeader = memoizee(fetchAfisTokenHeader_, {
  promise: true,
  // eslint-disable-next-line no-magic-numbers
  maxAge: 55 * ONE_MINUTE_MS,
});

/** Returns if the person logging in, is known in the AFIS source API */
export async function fetchIsKnownInAFIS(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const profileIdentifierType =
    authProfileAndToken.profile.profileType === 'commercial' ? 'KVK' : 'BSN';

  const additionalConfig: DataRequestConfig = {
    method: 'post',
    data: {
      [profileIdentifierType]: authProfileAndToken.profile.id,
    },
    transformResponse: (response) =>
      transformBusinessPartnerisKnownResponse(
        response,
        authProfileAndToken.profile.sid
      ),
    formatUrl(config) {
      return `${config.url}/businesspartner/${profileIdentifierType}/`;
    },
  };

  const dataRequestConfig = await getAfisApiConfig(additionalConfig);

  const response = await requestData<AfisBusinessPartnerKnownResponse | null>(
    dataRequestConfig,
    requestID,
    authProfileAndToken
  );

  return response;
}

function transformBusinessPartnerisKnownResponse(
  response:
    | AfisBusinessPartnerPrivateResponseSource
    | AfisBusinessPartnerCommercialResponseSource
    | string,
  sessionID: SessionID
) {
  if (!response || typeof response === 'string') {
    return null;
  }

  let isKnown: boolean = false;
  let businessPartnerId: string | null = null;
  let businessPartnerIdEncrypted: string | null = null;

  if ('Record' in response) {
    // Responses can include multiple records or just one, for clarity we treat the response as always having an array of Records here.
    const records = !Array.isArray(response.Record)
      ? [response.Record]
      : response.Record;

    const record = records.find((record) => record.Gevonden === 'Ja');

    if (record) {
      isKnown = true;
      businessPartnerId = record.Zakenpartnernummer ?? null;
    }
  } else if ('BSN' in response) {
    isKnown = response.Gevonden === 'Ja';
    businessPartnerId = response.Zakenpartnernummer ?? null;
  }

  if (businessPartnerId) {
    businessPartnerIdEncrypted = encryptSessionIdWithRouteIdParam(
      sessionID,
      businessPartnerId
    );
  }

  return {
    isKnown,
    businessPartnerIdEncrypted,
  };
}
