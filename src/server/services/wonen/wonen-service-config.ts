import { isEnabled } from '../../config/azure-appconfiguration.ts';
import type { DataRequestConfig } from '../../config/source-api.ts';
import { getFromEnv } from '../../helpers/env.ts';

export const featureToggle = {
  service: {
    fetchWonen: {
      isEnabled: isEnabled('WONEN.vve'),
    },
  },
} as const;

export const ZWDApiReqestConfig: DataRequestConfig = {
  url: `${getFromEnv('BFF_ZWD_API_BASE_URL')}`,
  method: 'GET',
  headers: { Authorization: `Token ${getFromEnv('BFF_ZWD_API_TOKEN')}` },
} as const;


export const EnergieLabelRequestConfig: DataRequestConfig = {
  url:
    getFromEnv('BFF_ENERGIE_LABEL_API_URL', false) ||
    'https://api.data.amsterdam.nl/v1/duurzaamheid/energielabel',
  headers: { 'X-Api-Key': getFromEnv('BFF_DATA_AMSTERDAM_API_KEY', false) },
} as const;

