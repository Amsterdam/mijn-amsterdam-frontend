import { parseISO } from 'date-fns';

import { fetchAfisTokenHeader } from './afis';
import { AfisApiFeedResponseSource } from './afis-types';
import { defaultDateFormat } from '../../../universal/helpers/date';
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

export function getEmandateValidityDateFormatted(dateValidTo: string | null) {
  const dateValidToFormatted =
    dateValidTo && !dateValidTo.includes('9999')
      ? defaultDateFormat(dateValidTo)
      : dateValidTo
        ? 'Doorlopend'
        : null;

  return dateValidToFormatted;
}

export function isEmandateActive(dateValidTo: string | null) {
  if (!dateValidTo) {
    return false;
  }
  // Active if date is in the future.
  return parseISO(dateValidTo) > new Date();
}

export const EMANDATE_STATUS = {
  ON: '1',
  OFF: '0',
} as const;

export function getEmandateStatus(dateValidTo: string | null) {
  return isEmandateActive(dateValidTo)
    ? EMANDATE_STATUS.ON
    : EMANDATE_STATUS.OFF;
}

export function getEmandateDisplayStatus(
  dateValidTo: string | null,
  dateValidFromFormatted: string | null
): string {
  if (isEmandateActive(dateValidTo)) {
    return `Actief sinds ${dateValidFromFormatted}`;
  }
  return 'Niet actief';
}
