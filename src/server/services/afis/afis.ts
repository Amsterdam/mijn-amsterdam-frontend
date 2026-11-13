import { createHash } from 'node:crypto';

import {
  type ApiResponse,
  apiErrorResult,
  apiSuccessResult,
  getFailedDependencies,
} from '../../../universal/helpers/api.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { ONE_MINUTE_MS } from '../../config/app.ts';
import type { DataRequestConfig } from '../../config/source-api.ts';
import { encryptPayloadAndSessionID } from '../../helpers/encrypt-decrypt.ts';
import { getFromEnv } from '../../helpers/env.ts';
import {
  createSessionBasedCacheKey,
  getApiConfig,
} from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';
import { fetchAuthTokenHeader } from '../iam-oauth/oauth-token.ts';
import { fetchBusinessPartnerFullName } from './afis-business-partner.ts';
import { fetchAfisFacturenOverview } from './afis-facturen.ts';
import { formatBusinessPartnerId, getAfisApiConfig } from './afis-helpers.ts';
import type {
  AfisAccount,
  AfisBusinessPartnerCommercialResponseSource,
  AfisBusinessPartnerPrivateResponseSource,
  AfisThemaResponse,
} from './afis-types.ts';

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

type AuthorizedAfisAccount = AfisAccount & { businessPartnerId: string };

function transformBusinessPartnerAccounts(
  response:
    | AfisBusinessPartnerPrivateResponseSource
    | AfisBusinessPartnerCommercialResponseSource
    | string,
  auth: AuthProfileAndToken
): AuthorizedAfisAccount[] | null {
  if (!response || typeof response === 'string') {
    return null;
  }

  const isCommercial = auth.profile.profileType === 'commercial';
  const records =
    'Record' in response
      ? Array.isArray(response.Record)
        ? response.Record
        : [response.Record]
      : 'BSN' in response
        ? [response]
        : [];

  return records
    .filter((record) => {
      if (record.Gevonden !== 'Ja' || !record.Zakenpartnernummer) {
        return false;
      }
      if (!isCommercial) {
        return true;
      }
      return (
        record.Blokkade !== 'Ja' &&
        (!auth.profile.vestigingsnummer ||
          ('Vestigingsnummer' in record &&
            record.Vestigingsnummer === auth.profile.vestigingsnummer))
      );
    })
    .map((record) => {
      const businessPartnerId = formatBusinessPartnerId(
        record.Zakenpartnernummer
      );
      return {
        id: businessPartnerId,
        businessPartnerId,
        businessPartnerIdEncrypted: encryptPayloadAndSessionID(
          auth.profile.sid,
          { businessPartnerId }
        ),
        vestigingsnummer:
          'Vestigingsnummer' in record
            ? (record.Vestigingsnummer ?? null)
            : null,
        name: null,
      };
    });
}

export async function fetchAfisAccounts(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<AuthorizedAfisAccount[]>> {
  const profileIdentifierType =
    authProfileAndToken.profile.profileType === 'commercial' ? 'KVK' : 'BSN';

  const additionalConfig: DataRequestConfig = {
    method: 'post',
    data: {
      [profileIdentifierType]: authProfileAndToken.profile.id,
      ...(profileIdentifierType === 'KVK' &&
      authProfileAndToken.profile.vestigingsnummer
        ? { Vestigingsnummer: authProfileAndToken.profile.vestigingsnummer }
        : {}),
    },
    transformResponse: (response) =>
      transformBusinessPartnerAccounts(response, authProfileAndToken),
    cacheKey_UNSAFE: createSessionBasedCacheKey(
      authProfileAndToken.profile.sid,
      `afis-accounts:${authProfileAndToken.profile.id}:${authProfileAndToken.profile.vestigingsnummer ?? ''}`
    ),
    formatUrl(config) {
      return `${config.url}/businesspartner/${profileIdentifierType}/`;
    },
  };

  const dataRequestConfig = await getAfisApiConfig(additionalConfig);

  return requestData<AuthorizedAfisAccount[]>(
    dataRequestConfig,
    authProfileAndToken
  );
}

export async function authorizeAfisAccount(
  auth: AuthProfileAndToken,
  businessPartnerId: unknown
) {
  if (auth.profile.profileType !== 'commercial') {
    return apiSuccessResult(true);
  }
  const accounts = await fetchAfisAccounts(auth);
  if (accounts.status !== 'OK') {
    return accounts;
  }
  if (
    typeof businessPartnerId !== 'string' ||
    !accounts.content?.some(
      (account) => account.businessPartnerId === businessPartnerId
    )
  ) {
    return apiErrorResult('Not authorized for this AFIS account', null, 403);
  }
  return apiSuccessResult(true);
}

export async function fetchIsKnownInAFIS(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<AfisThemaResponse>> {
  const response = await fetchAfisAccounts(authProfileAndToken);
  if (response.status !== 'OK') {
    return response;
  }
  const accounts = response.content ?? [];
  const selected =
    accounts.find((account) => !account.vestigingsnummer) ?? accounts[0];
  if (!selected) {
    return apiSuccessResult({
      isKnown: false,
      businessPartnerIdEncrypted: null,
      facturen: null,
    });
  }

  const isCommercial = authProfileAndToken.profile.profileType === 'commercial';
  const accountOptions = isCommercial
    ? await Promise.all(
        accounts.map(async ({ businessPartnerId, ...account }) => {
          const nameResponse =
            await fetchBusinessPartnerFullName(businessPartnerId);
          return {
            ...account,
            name:
              nameResponse.status === 'OK'
                ? (nameResponse.content?.fullName ?? null)
                : null,
          };
        })
      )
    : undefined;

  const facturenResponse = await fetchAfisFacturenOverview(
    authProfileAndToken.profile.sid,
    {
      businessPartnerID: selected.businessPartnerId,
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
      isKnown: true,
      businessPartnerIdEncrypted: selected.businessPartnerIdEncrypted,
      ...(isCommercial
        ? {
            accounts: accountOptions,
            isRestricted: !!authProfileAndToken.profile.vestigingsnummer,
            selectionKey: createHash('sha256')
              .update(`${authProfileAndToken.profile.sid}:${authProfileAndToken.profile.id}:${authProfileAndToken.profile.vestigingsnummer ?? ''}`)
              .digest('hex'),
          }
        : {}),
      facturen: facturenResponse.content,
    },
    failedDependencies
  );
}
