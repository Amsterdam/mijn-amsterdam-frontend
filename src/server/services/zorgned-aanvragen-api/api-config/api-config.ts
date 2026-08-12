import { hliAanvragenApiConfig } from './hli-api-config.ts';
import { jzdAanvragenApiConfig } from './jzd-api-config.ts';
import { fetchZorgnedAanvragenHLI } from '../../hli/hli-zorgned-service.ts';
import { fetchZorgnedAanvragenJeugd } from '../../jzd/jeugd/jeugd.ts';
import { fetchZorgnedAanvragenWMO } from '../../jzd/wmo/wmo-zorgned-service.ts';

export const clientToServiceMap = {
  WMO: {
    fetch: fetchZorgnedAanvragenWMO,
    apiConfig: jzdAanvragenApiConfig,
  },
  LLV: {
    fetch: fetchZorgnedAanvragenJeugd,
    apiConfig: jzdAanvragenApiConfig,
  },
  HLI: {
    fetch: fetchZorgnedAanvragenHLI,
    apiConfig: hliAanvragenApiConfig,
  },
} as const;
