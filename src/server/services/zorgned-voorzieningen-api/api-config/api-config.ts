import { jzdVoorzieningenApiConfig } from './jzd-api-config.ts';
import { fetchZorgnedAanvragenHLI } from '../../hli/hli-zorgned-service.ts';
import { fetchZorgnedAanvragenJeugd } from '../../jzd/jeugd/jeugd.ts';
import { fetchZorgnedAanvragenWMO } from '../../jzd/wmo/wmo-zorgned-service.ts';

export const clientToServiceMap = {
  WMO: {
    fetch: fetchZorgnedAanvragenWMO,
    apiConfig: jzdVoorzieningenApiConfig,
  },
  LLV: {
    fetch: fetchZorgnedAanvragenJeugd,
    apiConfig: jzdVoorzieningenApiConfig,
  },
  HLI: {
    fetch: fetchZorgnedAanvragenHLI,
    apiConfig: jzdVoorzieningenApiConfig,
  },
} as const;
