import { parseISO } from 'date-fns';

import { fetchAfisTokenHeader } from './afis';
import { EMANDATE_ENDDATE_INDICATOR } from './afis-e-mandates-config';
import { AfisApiFeedResponseSource } from './afis-types';
import { toDateFormatted } from '../../../universal/helpers/date';
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
  additionalConfig?: DataRequestConfig
): Promise<DataRequestConfig> {
  // If Afis EnableU is active, token fetching is taken care of by EnableU Gateway.
  const authHeader =
    getFromEnv('BFF_AFIS_ENABLE_DIRECT_TOKEN_FETCHING') === 'true'
      ? await fetchAfisTokenHeader()
      : { apiKey: getFromEnv('BFF_ENABLEU_API_KEY') };

  const additionalConfigWithHeader: DataRequestConfig = {
    ...(additionalConfig ?? null),
    headers: {
      'Content-Type': 'application/json',
      ...authHeader,
    },
  };
  return getApiConfig('AFIS', additionalConfigWithHeader);
}

export function getEmandateValidityDateFormatted(dateValidTo: string | null) {
  return dateValidTo?.includes(EMANDATE_ENDDATE_INDICATOR)
    ? 'Doorlopend'
    : toDateFormatted(dateValidTo);
}

export function isEmandateActive(dateValidTo: string | null) {
  if (!dateValidTo) {
    return false;
  }
  // Active if date is in the future.
  return parseISO(dateValidTo) > new Date();
}

export const EMANDATE_STATUS_FRONTEND = {
  ON: '1', // AfisEMandateStatusCodes['1'],
  OFF: '0', // AfisEMandateStatusCodes['0'],
} as const;

export function getEmandateStatusFrontend(dateValidTo: string | null) {
  // return EMANDATE_STATUS.ON;
  return isEmandateActive(dateValidTo)
    ? EMANDATE_STATUS_FRONTEND.ON
    : EMANDATE_STATUS_FRONTEND.OFF;
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
