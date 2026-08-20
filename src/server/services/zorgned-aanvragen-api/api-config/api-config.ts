import { hliAanvragenApiConfig } from './hli-api-config.ts';
import { llvAanvragenApiConfig } from './llv-api-config.ts';
import { wmoAanvragenApiConfig } from './wmo-api-config.ts';
import { fetchZorgnedAanvragenHLI } from '../../hli/hli-zorgned-service.ts';
import { fetchZorgnedAanvragenJeugd } from '../../jzd/jeugd/jeugd.ts';
import { fetchZorgnedAanvragenWMO } from '../../jzd/wmo/wmo-zorgned-service.ts';

export const clientToServiceMap = {
  WMO: {
    fetch: fetchZorgnedAanvragenWMO,
    apiConfig: wmoAanvragenApiConfig,
  },
  LLV: {
    fetch: fetchZorgnedAanvragenJeugd,
    apiConfig: llvAanvragenApiConfig,
  },
  HLI: {
    fetch: fetchZorgnedAanvragenHLI,
    apiConfig: hliAanvragenApiConfig,
  },
} as const;

export type ClientToServiceMap = typeof clientToServiceMap;
