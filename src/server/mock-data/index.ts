import { MyTip } from '../../universal/types';
import { ApiUrls, DEV_USER_TYPE_HEADER } from '../config';
import AFVAL from './json/afvalophaalgebieden.json';
import BAG from './json/bag.json';
import BAG2 from './json/bag2.json';
import BELASTINGEN from './json/belasting.json';
import BRP from './json/brp.json';
import ERFPACHT from './json/erfpacht.json';
import FOCUS_AANVRAGEN from './json/focus-aanvragen.json';
import FOCUS_COMBINED from './json/focus-combined.json';
import KVK1 from './json/kvk-handelsregister.json';
import KVK2 from './json/kvk-handelsregister2.json';
import MILIEUZONE from './json/milieuzone.json';
import TIPS from './json/tips.json';
import VERGUNNINGEN from './json/vergunningen.json';
import WMO from './json/wmo.json';

export function resolveWithDelay(delayMS: number = 0, data: any) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, delayMS);
  });
}

async function loadMockApiResponseJson(data: any) {
  return JSON.stringify(data);
}

function isCommercialUser(config: any) {
  return config?.headers[DEV_USER_TYPE_HEADER] === 'BEDRIJF';
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
  [ApiUrls.WMO]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return await loadMockApiResponseJson(WMO);
    },
  },
  [ApiUrls.FOCUS_AANVRAGEN]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    // delay: 3400,
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return await loadMockApiResponseJson(FOCUS_AANVRAGEN);
    },
  },
  [ApiUrls.FOCUS_COMBINED]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return await loadMockApiResponseJson(FOCUS_COMBINED);
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
        return await loadMockApiResponseJson(VERGUNNINGEN);
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

      const sourceTips = requestData?.data
        ? Object.values(requestData.data)
            .filter(
              responseContent =>
                typeof responseContent === 'object' &&
                responseContent !== null &&
                'tips' in responseContent
            )
            .flatMap((responseContent: any) => responseContent.tips)
        : [];

      const items = [
        ...(tips as MyTip[]),
        ...sourceTips.map(tip => Object.assign(tip, { isPersonalized: true })),
      ]
        .filter((tip: MyTip) =>
          requestData?.optin ? tip.isPersonalized : !tip.isPersonalized
        )
        .map(tip => {
          if (config.params.audience !== 'persoonlijk') {
            return Object.assign(tip, {
              title: `[${config.params.audience}] ${tip.title}`,
            });
          }
          return tip;
        });
      return JSON.stringify(items);
    },
  },
};
