import { parseISO } from 'date-fns';
import createDebugger from 'debug';

import { fetchAfisTokenHeader } from './afis';
import { EMANDATE_ENDDATE_INDICATOR } from './afis-e-mandates-config';
import {
  AfisApiFeedResponseSource,
  type BusinessPartnerId,
} from './afis-types';
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

export type EmandateStatusFrontend =
  (typeof EMANDATE_STATUS_FRONTEND)[keyof typeof EMANDATE_STATUS_FRONTEND];

export function getEmandateStatusFrontend(
  currentStatus: EmandateStatusFrontend,
  dateValidTo: string | null
) {
  return isEmandateActive(dateValidTo) &&
    currentStatus === EMANDATE_STATUS_FRONTEND.ON
    ? EMANDATE_STATUS_FRONTEND.ON
    : EMANDATE_STATUS_FRONTEND.OFF;
}

export function getEmandateDisplayStatus(
  currentStatus: EmandateStatusFrontend,
  dateValidTo: string | null,
  dateValidFromFormatted: string | null
): string {
  if (
    getEmandateStatusFrontend(currentStatus, dateValidTo) ===
    EMANDATE_STATUS_FRONTEND.ON
  ) {
    return `Actief sinds ${dateValidFromFormatted}`;
  }
  return 'Niet actief';
}

const debugEmandates_ = createDebugger('afis:emandates');

export function debugEmandates(...args: Parameters<typeof debugEmandates_>) {
  const argsRedacted = args.map((arg) => {
    if (typeof arg === 'object' && arg !== null) {
      return redactEmandateData(arg);
    }
    return arg;
  });
  debugEmandates_(...(argsRedacted as Parameters<typeof debugEmandates_>));
}

export function formatBusinessPartnerId(
  businessPartnerId: BusinessPartnerId
): string {
  return businessPartnerId.padStart(10, '0');
}

export function redactEmandateData<
  T extends { iban?: string; SndIban?: string; senderIBAN?: string },
>(data: T): T {
  const ibanProps = ['SndIban', 'iban', 'senderIBAN'] as const;
  return ibanProps.reduce(
    (acc, prop) => {
      if (acc[prop]) {
        return {
          ...acc,
          [prop]: `${acc[prop]!.slice(0, 2)}****${acc[prop]!.slice(-4)}`,
        };
      }
      return acc;
    },
    { ...data }
  );
}
