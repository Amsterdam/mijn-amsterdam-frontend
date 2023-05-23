import { apiSuccessResult } from '../../universal/helpers';
import { ApiUrls, oidcConfigEherkenning } from '../config';
// Import JSON files because they get included in the bundle this way.
// The JSON files represent the data output of the MA Python api's.
import { decodeToken } from '../helpers/app';
import AKTES from './json/aktes.json';
import AVG from './json/avg.json';
import BELASTINGEN from './json/belasting.json';
import BEZWAREN from './json/bezwaren.json';
import BEZWAREN_DOCUMENTS from './json/bezwaren-documents.json';
import BRP from './json/brp.json';
import ERFPACHT_NOTIFICATIONS from './json/erfpacht-notifications.json';
import ERFPACHT from './json/erfpacht.json';
import KLACHTEN from './json/klachten.json';
import KREFIA from './json/krefia.json';
import KVK1 from './json/kvk-handelsregister.json';
import KVK2 from './json/kvk-handelsregister2.json';
import LOODMETINGEN from './json/loodmetingen.json';
import LOODMETING_RAPPORT from './json/loodmeting_rapport.json';
import MILIEUZONE from './json/milieuzone.json';
import TOERISTISCHE_VERHUUR_REGISTRATIES_BSN from './json/registraties-toeristische-verhuur-bsn.json';
import SIA from './json/sia-meldingen.json';
import SIA_ATTACHMENTS from './json/sia-melding-attachments.json';
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

interface DataConfigObject {
  method?: 'post' | 'get';
  status: (args?: any) => number;
  responseData: any;
  delay?: number;
  networkError?: boolean;
  headers?: Record<string, string>;
  params?: Record<string, string | ((actual: any) => void)>;
  pathReg?: RegExp;
}
type MockDataConfig = Record<string, DataConfigObject | DataConfigObject[]>;

export const mockDataConfig: MockDataConfig = {
  [String(ApiUrls.BELASTINGEN)]: {
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      // if (isCommercialUser(config)) {
      //   return 'no-content';
      // }
      return await loadMockApiResponseJson(BELASTINGEN);
    },
  },
  [String(ApiUrls.BRP)]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    // delay: 2500,
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return await loadMockApiResponseJson(BRP);
    },
  },
  [String(ApiUrls.BEZWAREN_LIST)]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    // delay: 2500,
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return await loadMockApiResponseJson(BEZWAREN);
    },
  },
  [String(ApiUrls.BEZWAREN_DOCUMENTS)]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    // delay: 2500,
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return await loadMockApiResponseJson(BEZWAREN_DOCUMENTS);
    },
  },
  [String(ApiUrls.AKTES)]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    // delay: 2500,
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return await loadMockApiResponseJson(AKTES);
    },
  },
  [String(ApiUrls.WMO)]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return await loadMockApiResponseJson(WMO);
    },
  },
  [String(ApiUrls.WPI_AANVRAGEN)]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    // delay: 3400,
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return await loadMockApiResponseJson(WPI_AANVRAGEN);
    },
  },
  [String(ApiUrls.WPI_E_AANVRAGEN)]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return await loadMockApiResponseJson(WPI_E_AANVRAGEN);
    },
  },
  [String(ApiUrls.WPI_STADSPAS)]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return await loadMockApiResponseJson(WPI_STADSPAS);
    },
  },
  [String(ApiUrls.WPI_SPECIFICATIES)]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return await loadMockApiResponseJson(WPI_SPECIFICATIES);
    },
  },
  [String(ApiUrls.ERFPACHT)]: {
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
  [String(ApiUrls.SUBSIDIE)]: {
    pathReg: new RegExp('/remote/subsidies/*'),
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      // if (isCommercialUser(config)) {
      //   return 'no-content';
      // }
      return await loadMockApiResponseJson(SUBSIDIE);
    },
  },
  // [String(ApiUrls.SIA)]: {
  //   status: (config: any) => (isCommercialUser(config) ? 200 : 200),
  //   responseData: async (config: any) => {
  //     // if (isCommercialUser(config)) {
  //     //   return await loadMockApiResponseJson(MILIEUZONE);
  //     // }
  //     return await loadMockApiResponseJson(SIA);
  //   },
  // },
  [`${ApiUrls.SIA}3fa85f64-5717-4562-b3fc-2c963f66afa6/attachments`]: {
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      // if (isCommercialUser(config)) {
      //   return await loadMockApiResponseJson(MILIEUZONE);
      // }
      return await loadMockApiResponseJson(SIA_ATTACHMENTS);
    },
  },
  // [String(ApiUrls.AFVAL)]: {
  //   status: (config: any) => (isCommercialUser(config) ? 200 : 200),
  //   responseData: async (config: any) => {
  //     // if (isCommercialUser(config)) {
  //     //   return 'no-content';
  //     // }
  //     return await loadMockApiResponseJson(AFVAL);
  //   },
  // },
  [String(ApiUrls.CLEOPATRA)]: {
    method: 'post',
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      // if (isCommercialUser(config)) {
      //   return await loadMockApiResponseJson(MILIEUZONE);
      // }
      return await loadMockApiResponseJson(MILIEUZONE);
    },
  },
  [String(ApiUrls.VERGUNNINGEN)]: {
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        const vergunningenCommercial = VERGUNNINGEN.content.filter(
          (vergunning) => {
            // NOTE: Never a commercial permit.
            return ![
              'Vakantieverhuur vergunningsaanvraag',
              'Parkeerontheffingen Blauwe zone particulieren',
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

  [String(ApiUrls.KVK)]: {
    // delay: 12000,
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return await loadMockApiResponseJson(KVK2);
      }
      return await loadMockApiResponseJson(KVK1);
    },
  },
  [String(ApiUrls.TOERISTISCHE_VERHUUR_REGISTRATIES + '/bsn')]: {
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
  [String(ApiUrls.TOERISTISCHE_VERHUUR_REGISTRATIES + '/:number')]: {
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
  [String(ApiUrls.KREFIA)]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      // if (isCommercialUser(config)) {
      //   return await loadMockApiResponseJson(KREFIA);
      // }
      return await loadMockApiResponseJson(KREFIA);
    },
  },
  [String(ApiUrls.ENABLEU_2_SMILE)]: [
    {
      status: (config: any) => (isCommercialUser(config) ? 500 : 200),
      method: 'post',
      responseData: async (config: any) => {
        return await loadMockApiResponseJson(KLACHTEN);
      },
      params: {
        asymmetricMatch: function (actual: any) {
          return actual.getBuffer().toString().includes('readKlacht');
        },
      },
    },
    {
      status: (config: any) => (isCommercialUser(config) ? 500 : 200),
      method: 'post',
      responseData: async (config: any) => {
        return await loadMockApiResponseJson(AVG);
      },
      params: {
        asymmetricMatch: function (actual: any) {
          return actual.getBuffer().toString().includes('readAVGverzoek');
        },
      },
    },
  ],
  [String(`${ApiUrls.LOOD_365}/be_getrequestdetails`)]: {
    status: () => 200,
    responseData: async (config: any) => {
      return await loadMockApiResponseJson(LOODMETINGEN);
    },
  },
  [String(`${ApiUrls.LOOD_365}/be_downloadleadreport`)]: {
    status: () => 200,
    method: 'post',
    responseData: async (config: any) => {
      // if (isCommercialUser(config)) {
      //   return await loadMockApiResponseJson(KREFIA);
      // }
      return await loadMockApiResponseJson(LOODMETING_RAPPORT);
    },
  },
};
