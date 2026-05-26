import { salesforceDataRequestConfig } from './klantcontact-service-config.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import type { DataRequestConfig } from '../../config/source-api.ts';
import { encrypt } from '../../helpers/encrypt-decrypt.ts';
import { getFromEnv } from '../../helpers/env.ts';
import { getCustomApiConfigWithCacheKey } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';

export async function fetchSalesforceApi<T>(
  authProfileAndToken: AuthProfileAndToken,
  dataRequestConfigSpecific: DataRequestConfig
) {
  const base64encodedPK = getFromEnv(
    'BFF_CONTACTMOMENTEN_PRIVATE_ENCRYPTION_KEY',
    true
  )!;
  const [, encryptedBSN, iv] = encrypt(
    authProfileAndToken.profile.id,
    Buffer.from(base64encodedPK, 'base64')
  );
  const dataRequestConfigBase = getCustomApiConfigWithCacheKey(
    'SALESFORCE',
    salesforceDataRequestConfig,
    dataRequestConfigSpecific,
    {
      params: {
        hadBetrokkene__uuid: encryptedBSN.toString('base64'),
        iv: iv.toString('base64'),
        pageSize: 100,
        ...dataRequestConfigSpecific.params,
      },
    }
  );
  return requestData<T>(dataRequestConfigBase);
}
