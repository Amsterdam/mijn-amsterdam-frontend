import { fetchAfisTokenHeader } from './afis';
import { AfisApiFeedResponseSource } from './afis-types';
import { DataRequestConfig } from '../../config/source-api';
import { getFromEnv } from '../../helpers/env';
import { getApiConfig } from '../../helpers/source-api-helpers';

export function getFeedEntryProperties<T>(
  response: AfisApiFeedResponseSource<T>
) {
  if (Array.isArray(response?.feed?.entry)) {
    return response.feed.entry
      .map((entry) => {
        return entry?.content?.properties ?? null;
      })
      .filter((entry) => entry !== null);
  }

  return [];
}

export async function getAfisApiConfig(
  additionalConfig?: DataRequestConfig,
  useApiConfigBasedCallstackCacheKeyTransform: boolean = true
): Promise<DataRequestConfig> {
  // If Afis EnableU is active, token fetching is taken care of by EnableU Gateway.
  const authHeader =
    getFromEnv('BFF_AFIS_ENABLE_DIRECT_TOKEN_FETCHING') === 'true'
      ? await fetchAfisTokenHeader()
      : { apiKey: getFromEnv('BFF_ENABLEU_API_KEY_AFIS') };

  const additionalConfigWithHeader: DataRequestConfig = {
    ...(additionalConfig ?? null),
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
    },
  };
  return getApiConfig('AFIS', additionalConfigWithHeader, {
    useApiConfigBasedCallstackCacheKeyTransform:
      useApiConfigBasedCallstackCacheKeyTransform,
  });
}
