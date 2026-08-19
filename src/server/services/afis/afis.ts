import { fetchAfisFacturenOverview } from './afis-facturen.ts';
import { formatBusinessPartnerId, getAfisApiConfig } from './afis-helpers.ts';
import type {
  AfisBusinessPartnerCommercialResponseSource,
  AfisThemaResponse,
  AfisBusinessPartnerPrivateResponseSource,
  AfisKnownBusinessPartner,
} from './afis-types.ts';
import {
  apiSuccessResult,
  getFailedDependencies,
  type ApiResponse,
} from '../../../universal/helpers/api.ts';
import { omit } from '../../../universal/helpers/utils.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { ONE_MINUTE_MS } from '../../config/app.ts';
import type { DataRequestConfig } from '../../config/source-api.ts';
import { encryptPayloadAndSessionID } from '../../helpers/encrypt-decrypt.ts';
import { getFromEnv } from '../../helpers/env.ts';
import {
  getApiConfig,
  createSessionBasedCacheKey,
} from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';
import { fetchVestigingen } from '../hr-kvk/hr-kvk.ts';
import { fetchAuthTokenHeader } from '../iam-oauth/oauth-token.ts';
import { captureMessage } from '../monitoring.ts';

export async function fetchAfisTokenHeader() {
  const tokenHeaderResponse = await fetchAuthTokenHeader(
    'IAM_MS_OAUTH',
    {
      url: `${getApiConfig('AFIS').url}/OAuthServer`,
      sourceApiName: 'AFIS',
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

  console.log(response);

  let isKnown: boolean = false;
  let businessPartnerId: string | null = null;
  let businessPartnerIdEncrypted: string | null = null;
  let businessPartners: AfisKnownBusinessPartner[] | null = null;

  const isPrivateBusinessPartner = 'BSN' in response;

  if ('Record' in response) {
    // Responses can include multiple records or just one, for clarity we treat the response as always having an array of Records here.
    const records = (
      !Array.isArray(response.Record) ? [response.Record] : response.Record
    ).filter((record) => record.Gevonden === 'Ja' && record.Blokkade !== 'Ja');

    if (records.length > 0) {
      isKnown = true;
    }

    if (records.length === 1) {
      businessPartnerId = records[0].Zakenpartnernummer;
    } else if (records.length > 1) {
      const recordsWithVestigingsnummer = records.filter(
        (record) => !!record.Vestigingsnummer
      );

      if (recordsWithVestigingsnummer.length > 0) {
        businessPartners = recordsWithVestigingsnummer.map((record) => ({
          kvkVestigingsnummer: record.Vestigingsnummer!,
          businessPartnerId: record.Zakenpartnernummer,
          vestigingsNaam: `Vestiging ${record.Vestigingsnummer}`,
        }));
      } else {
        captureMessage(
          `AFIS: Multiple business partners found for KVK ${records[0].KVK}, but none have a Vestigingsnummer.`
        );
      }
    }
  } else if (isPrivateBusinessPartner) {
    isKnown = response.Gevonden === 'Ja';
    businessPartnerId = response.Zakenpartnernummer ?? null;
  }

  businessPartnerId = businessPartnerId
    ? formatBusinessPartnerId(businessPartnerId)
    : null;

  if (businessPartnerId) {
    businessPartnerIdEncrypted = encryptPayloadAndSessionID(sessionID, {
      businessPartnerId,
    });
  }

  const themaResponseContent: Omit<AfisThemaResponse, 'facturen'> = {
    isKnown,
    businessPartnerIdEncrypted,
  };

  if (isKnown && businessPartnerId) {
    themaResponseContent.businessPartnerId = businessPartnerId;
  } else if (isKnown && businessPartners?.length) {
    themaResponseContent.businessPartners = businessPartners;
  }

  return themaResponseContent;
}

/** Returns if the person logging in, is known in the AFIS source API */
export async function fetchIsKnownInAFIS(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<AfisThemaResponse>> {
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

  const response = await requestData<AfisThemaResponse>(
    dataRequestConfig,
    authProfileAndToken
  );

  if (
    response.status !== 'OK' ||
    !response.content ||
    !response.content.isKnown
  ) {
    return response;
  }

  if (!response.content.businessPartnerId) {
    if (!response.content.businessPartners?.length) {
      return response;
    }

    const kvkVestigingen = await fetchVestigingen(authProfileAndToken);
    if (kvkVestigingen.status !== 'OK') {
      return response;
    }
    return apiSuccessResult({
      isKnown: response.content.isKnown,
      businessPartnerIdEncrypted: null,
      businessPartners: response.content.businessPartners.map((bp) => {
        const vestiging = kvkVestigingen.content.find(
          (v) => v.vestigingsNummer === bp.kvkVestigingsnummer
        );
        return {
          ...bp,
          vestigingsNaam: `${vestiging?.naam ?? bp.vestigingsNaam} ${bp.businessPartnerId}`,
          businessPartnerIdEncrypted: encryptPayloadAndSessionID(
            authProfileAndToken.profile.sid,
            {
              businessPartnerId: bp.businessPartnerId,
            }
          ),
        };
      }),
      facturen: null,
    });
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
