import { apiSuccessResult } from '../../universal/helpers';
import { MyTip } from '../../universal/types';
import { ApiUrls, oidcConfigEherkenning } from '../config';
// Import JSON files because they get included in the bundle this way.
// The JSON files represent the data output of the MA Python api's.
import { decodeToken } from '../helpers/app';
import AFVAL from './json/afvalophaalgebieden.json';
import AKTES from './json/aktes.json';
import BAG from './json/bag.json';
import BAG2 from './json/bag2.json';
import BELASTINGEN from './json/belasting.json';
import BRP from './json/brp.json';
import ERFPACHT_NOTIFICATIONS from './json/erfpacht-notifications.json';
import ERFPACHT from './json/erfpacht.json';
import KLACHTEN from './json/klachten.json';
import KREFIA from './json/krefia.json';
import KVK1 from './json/kvk-handelsregister.json';
import KVK2 from './json/kvk-handelsregister2.json';
import MILIEUZONE from './json/milieuzone.json';
import TOERISTISCHE_VERHUUR_REGISTRATIES_BSN from './json/registraties-toeristische-verhuur-bsn.json';
import TOERISTISCHE_VERHUUR_REGISTRATIE from './json/registraties-toeristische-verhuur.json';
import SUBSIDIE from './json/subsidie.json';
import VERGUNNINGEN from './json/vergunningen.json';
import WMO from './json/wmo.json';
import WPI_AANVRAGEN from './json/wpi-aanvragen.json';
import WPI_E_AANVRAGEN from './json/wpi-e-aanvragen.json';
import WPI_SPECIFICATIES from './json/wpi-specificaties.json';
import WPI_STADSPAS from './json/wpi-stadspas.json';

export function resolveWithDelay(delayMS: number = 0, data: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delayMS);
  });
}

async function loadMockApiResponseJson(data: any) {
  return JSON.stringify(data);
}

function isCommercialUser(config: any) {
  const authHeader = config?.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const tokenData = decodeToken(authHeader.split('Bearer ').pop()) as {
        aud: string;
      };
      return tokenData?.aud === oidcConfigEherkenning.clientID;
    } catch (error) {
      // Don't do anything here. For Dev purposes we just try-and-decode and see if we recognize the content of the token. Nothing fancy.
    }
  }

  return false;
}

type MockDataConfig = Record<
  string,
  {
    method?: 'post' | 'get';
    status: (args?: any) => number;
    responseData: any;
    delay?: number;
    networkError?: boolean;
    headers?: Record<string, string>;
    params?: Record<string, string>;
    pathReg?: RegExp;
  }
>;

export const mockDataConfig: MockDataConfig = {
  [ApiUrls.BELASTINGEN]: {
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      // if (isCommercialUser(config)) {
      //   return 'no-content';
      // }
      return await loadMockApiResponseJson(BELASTINGEN);
    },
  },
  [ApiUrls.BRP]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    // delay: 2500,
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return await loadMockApiResponseJson(BRP);
    },
  },

  [ApiUrls.AKTES]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    // delay: 2500,
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return await loadMockApiResponseJson(AKTES);
    },
  },
  [ApiUrls.WMO]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return await loadMockApiResponseJson(WMO);
    },
  },
  [ApiUrls.WPI_AANVRAGEN]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    // delay: 3400,
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return await loadMockApiResponseJson(WPI_AANVRAGEN);
    },
  },
  [ApiUrls.WPI_E_AANVRAGEN]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return await loadMockApiResponseJson(WPI_E_AANVRAGEN);
    },
  },
  [ApiUrls.WPI_STADSPAS]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return await loadMockApiResponseJson(WPI_STADSPAS);
    },
  },
  [ApiUrls.WPI_SPECIFICATIES]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return await loadMockApiResponseJson(WPI_SPECIFICATIES);
    },
  },
  [ApiUrls.ERFPACHT]: {
    pathReg: new RegExp('/remote/erfpacht/*'),
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      if (config.url.includes('/notifications/')) {
        return await loadMockApiResponseJson(ERFPACHT_NOTIFICATIONS);
      }
      // if (isCommercialUser(config)) {
      //   return 'no-content';
      // }
      return await loadMockApiResponseJson(ERFPACHT);
    },
  },
  [ApiUrls.SUBSIDIE]: {
    pathReg: new RegExp('/remote/subsidies/*'),
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      // if (isCommercialUser(config)) {
      //   return 'no-content';
      // }
      return await loadMockApiResponseJson(SUBSIDIE);
    },
  },
  [ApiUrls.BAG]: {
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      // if (isCommercialUser(config)) {
      //   return 'no-content';
      // }
      if (config.params.q === 'Schakelstraat 16') {
        return await loadMockApiResponseJson(BAG2);
      }
      return await loadMockApiResponseJson(BAG);
    },
  },
  [ApiUrls.AFVAL]: {
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      // if (isCommercialUser(config)) {
      //   return 'no-content';
      // }
      return await loadMockApiResponseJson(AFVAL);
    },
  },
  [ApiUrls.CLEOPATRA]: {
    method: 'post',
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      // if (isCommercialUser(config)) {
      //   return await loadMockApiResponseJson(MILIEUZONE);
      // }
      return await loadMockApiResponseJson(MILIEUZONE);
    },
  },
  [ApiUrls.VERGUNNINGEN]: {
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        const vergunningenCommercial = VERGUNNINGEN.content.filter(
          (vergunning) => {
            return ![
              'Vakantieverhuur',
              'Vakantieverhuur vergunningsaanvraag',
            ].includes(vergunning.caseType);
          }
        );
        return await loadMockApiResponseJson(
          apiSuccessResult(vergunningenCommercial)
        );
      }
      return await loadMockApiResponseJson(VERGUNNINGEN);
    },
  },

  [ApiUrls.KVK]: {
    // delay: 12000,
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return await loadMockApiResponseJson(KVK2);
      }
      return await loadMockApiResponseJson(KVK1);
    },
  },
  [ApiUrls.TOERISTISCHE_VERHUUR_REGISTRATIES + '/bsn']: {
    method: 'post',
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      // if (isCommercialUser(config)) {
      //   return await loadMockApiResponseJson(TOERISTISCHE_VERHUUR_REGISTRATIES);
      // }
      return await loadMockApiResponseJson(
        TOERISTISCHE_VERHUUR_REGISTRATIES_BSN
      );
    },
  },
  [ApiUrls.TOERISTISCHE_VERHUUR_REGISTRATIES + '/:number']: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      // if (isCommercialUser(config)) {
      //   return await loadMockApiResponseJson(TOERISTISCHE_VERHUUR_REGISTRATIES);
      // }
      return await loadMockApiResponseJson({
        ...TOERISTISCHE_VERHUUR_REGISTRATIE,
        registrationNumber: config.url.split('/').pop(),
      });
    },
  },
  [ApiUrls.KREFIA]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      // if (isCommercialUser(config)) {
      //   return await loadMockApiResponseJson(KREFIA);
      // }
      return await loadMockApiResponseJson(KREFIA);
    },
  },
  [ApiUrls.KLACHTEN]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    method: 'post',
    responseData: async (config: any) => {
      return await loadMockApiResponseJson(KLACHTEN);
    },
  },
};
