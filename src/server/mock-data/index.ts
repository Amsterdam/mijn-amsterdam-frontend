import { apiSuccessResult } from '../../universal/helpers';
import { MyTip } from '../../universal/types';
import { ApiUrls } from '../config';
// Import JSON files because they get included in the bundle this way.
// The JSON files represent the data output of the MA Python api's.
import AFVAL from './json/afvalophaalgebieden.json';
import AKTES from './json/aktes.json';
import BAG from './json/bag.json';
import BAG2 from './json/bag2.json';
import BELASTINGEN from './json/belasting.json';
import BRP from './json/brp.json';
import ERFPACHT from './json/erfpacht.json';
import KREFIA from './json/krefia.json';
import KVK1 from './json/kvk-handelsregister.json';
import KVK2 from './json/kvk-handelsregister2.json';
import MILIEUZONE from './json/milieuzone.json';
import TOERISTISCHE_VERHUUR_REGISTRATIES from './json/registraties-toeristische-verhuur.json';
import SUBSIDIE from './json/subsidie.json';
import TIPS from './json/tips.json';
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
  // TODO: Check profileType / authMethod in Token package here.
  return config?.headers['xxxxxxxx???'] === 'eherkenning';
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
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      // if (isCommercialUser(config)) {
      //   return 'no-content';
      // }
      return await loadMockApiResponseJson(ERFPACHT);
    },
  },
  [ApiUrls.SUBSIDIE]: {
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
  [ApiUrls.MILIEUZONE]: {
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
  [ApiUrls.TIPS]: {
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    method: 'post',
    responseData: async (config: any) => {
      const requestData = JSON.parse(config.data);
      const content = await loadMockApiResponseJson(TIPS);
      const tips = JSON.parse(content);
      const sourceTips: MyTip[] = requestData?.tips || [];

      const items = [
        ...(tips as MyTip[]),
        ...sourceTips.map((tip) =>
          Object.assign(tip, { isPersonalized: true })
        ),
      ]
        .filter((tip: MyTip) =>
          requestData?.optin ? tip.isPersonalized : !tip.isPersonalized
        )
        .map((tip) => {
          return Object.assign(tip, {
            title: `[${config.params.audience}] ${tip.title}`,
          });
        });
      return JSON.stringify(items);
    },
  },

  [ApiUrls.TOERISTISCHE_VERHUUR_REGISTRATIES]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return await loadMockApiResponseJson(TOERISTISCHE_VERHUUR_REGISTRATIES);
      }
      return await loadMockApiResponseJson(TOERISTISCHE_VERHUUR_REGISTRATIES);
    },
  },
  [ApiUrls.KREFIA]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return await loadMockApiResponseJson(KREFIA);
      }
      return await loadMockApiResponseJson(KREFIA);
    },
  },
};
