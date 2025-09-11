import { fetchAfisFacturenOverview } from './afis-facturen';
import { getAfisApiConfig } from './afis-helpers';
import {
  AfisBusinessPartnerCommercialResponseSource,
  AfisThemaResponse,
  AfisBusinessPartnerPrivateResponseSource,
} from './afis-types';
import {
  apiSuccessResult,
  getFailedDependencies,
} from '../../../universal/helpers/api';
import { omit } from '../../../universal/helpers/utils';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { ONE_MINUTE_MS } from '../../config/app';
import { DataRequestConfig } from '../../config/source-api';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt';
import { getFromEnv } from '../../helpers/env';
import {
  getApiConfig,
  createSessionBasedCacheKey,
} from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { fetchAuthTokenHeader } from '../ms-oauth/oauth-token';

export async function fetchAfisTokenHeader() {
  const tokenHeaderResponse = await fetchAuthTokenHeader(
    {
      url: getApiConfig('AFIS').url,
      sourceApiName: 'AFIS',
      // eslint-disable-next-line no-magic-numbers
      tokenValidityMS: ONE_MINUTE_MS * 55, // Token is valid for 1 hour, expire it 5 minutes before.
    },
    {
      clientID: getFromEnv('BFF_AFIS_CLIENT_ID') ?? '',
      clientSecret: getFromEnv('BFF_AFIS_CLIENT_SECRET') ?? '',
    }
  );

  if (tokenHeaderResponse.status === 'ERROR') {
    throw new Error('AFIS: Could not fetch token');
  }

  return tokenHeaderResponse.content;
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

  businessPartnerId = businessPartnerId
    ? parseInt(businessPartnerId, 10).toString()
    : null;

  if (businessPartnerId) {
    businessPartnerIdEncrypted = encryptSessionIdWithRouteIdParam(
      sessionID,
      businessPartnerId
    );
  }

  const themaResponseContent: Omit<AfisThemaResponse, 'facturen'> = {
    isKnown,
    businessPartnerIdEncrypted,
  };

  if (isKnown) {
    themaResponseContent.businessPartnerId = businessPartnerId;
  }

  return themaResponseContent;
}

/** Returns if the person logging in, is known in the AFIS source API */
export async function fetchIsKnownInAFIS(
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
    cacheKey_UNSAFE: createSessionBasedCacheKey(
      authProfileAndToken.profile.sid,
      `afis-is-known`
    ),
    formatUrl(config) {
      return `${config.url}/businesspartner/${profileIdentifierType}/`;
    },
  };

  const dataRequestConfig = await getAfisApiConfig(additionalConfig);

  const response = await requestData<AfisThemaResponse | null>(
    dataRequestConfig,
    authProfileAndToken
  );

  if (
    response.status !== 'OK' ||
    !response.content ||
    !response.content.isKnown ||
    !response.content.businessPartnerId
  ) {
    return response;
  }

  const facturenResponse = await fetchAfisFacturenOverview(
    authProfileAndToken.profile.sid,
    {
      businessPartnerID: response.content.businessPartnerId,
    }
  );

  const failedDependencies = getFailedDependencies({
    facturenoverview: facturenResponse,
    ...('failedDependencies' in facturenResponse
      ? facturenResponse.failedDependencies
      : null),
  });

  return apiSuccessResult(
    {
      ...omit(response.content, ['businessPartnerId']),
      facturen: facturenResponse.content,
    },
    failedDependencies
  );
}
