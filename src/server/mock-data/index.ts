import { MyTip } from '../../universal/types';
import { ApiUrls, DEV_USER_TYPE_HEADER } from '../config';

import BELASTINGEN from './json/belasting.json';
import BRP from './json/brp.json';
import WMO from './json/wmo.json';
import FOCUS_AANVRAGEN from './json/focus-aanvragen.json';
import FOCUS_COMBINED from './json/focus-combined.json';
import BAG from './json/bag.json';
import AFVAL from './json/afvalophaalgebieden.json';
import MILIEUZONE from './json/milieuzone.json';
import TIPS from './json/tips.json';
import AMSTERDAM_CONTENT_GENERAL_INFO from './json/amsterdam-nl-content-uitleg.json';
import AMSTERDAM_CONTENT_FOOTER from './json/amsterdam-nl-content-footer.json';
import VERGUNNINGEN from './json/vergunningen.json';

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

type MockDataConfig = Record<
  string,
  {
    method?: 'post' | 'get';
    status: number;
    responseData: any;
    delay?: number;
    networkError?: boolean;
    headers?: Record<string, string>;
    params?: Record<string, string>;
  }
>;

export const mockDataConfig: MockDataConfig = {
  [ApiUrls.BELASTINGEN]: {
    status: 200,
    responseData: async (config: any) => {
      return await loadMockApiResponseJson(BELASTINGEN);
    },
  },
  [ApiUrls.BRP]: {
    status: 200,
    // delay: 2500,
    responseData: async () => await loadMockApiResponseJson(BRP),
  },
  [ApiUrls.WMO]: {
    status: 200,
    responseData: async () => await loadMockApiResponseJson(WMO),
  },
  [ApiUrls.FOCUS_AANVRAGEN]: {
    status: 200,
    // delay: 3400,
    responseData: async () => await loadMockApiResponseJson(FOCUS_AANVRAGEN),
  },
  [ApiUrls.FOCUS_COMBINED]: {
    status: 200,
    responseData: async () => await loadMockApiResponseJson(FOCUS_COMBINED),
  },
  [ApiUrls.ERFPACHT]: {
    status: 200,
    responseData: async (...args: any) => {
      return await JSON.stringify({ status: true });
    },
  },
  [ApiUrls.BAG]: {
    status: 200,
    responseData: async (...args: any) => {
      return await loadMockApiResponseJson(BAG);
    },
  },
  [ApiUrls.AFVAL]: {
    status: 200,
    responseData: async () => await loadMockApiResponseJson(AFVAL),
  },
  [ApiUrls.MILIEUZONE]: {
    status: 200,
    responseData: async () => await loadMockApiResponseJson(MILIEUZONE),
  },
  [ApiUrls.CMS_CONTENT_GENERAL_INFO]: {
    status: 200,
    responseData: async () =>
      await loadMockApiResponseJson(AMSTERDAM_CONTENT_GENERAL_INFO),
  },
  [ApiUrls.CMS_CONTENT_FOOTER]: {
    status: 200,
    responseData: async () =>
      await loadMockApiResponseJson(AMSTERDAM_CONTENT_FOOTER),
  },
  [ApiUrls.VERGUNNINGEN]: {
    status: 200,
    responseData: async () => await loadMockApiResponseJson(VERGUNNINGEN),
  },
  [ApiUrls.TIPS]: {
    status: 200,
    method: 'post',
    responseData: async (config: any) => {
      const requestData = JSON.parse(config.data);
      const content = await loadMockApiResponseJson(TIPS);
      const tips = JSON.parse(content);
      const sourceTips = Object.values(requestData.data)
        .filter(
          responseContent =>
            typeof responseContent === 'object' &&
            responseContent !== null &&
            'tips' in responseContent
        )
        .flatMap((responseContent: any) => responseContent.tips);

      const items = [
        ...(tips as MyTip[]),
        ...sourceTips.map(tip => Object.assign(tip, { isPersonalized: true })),
      ].filter((tip: MyTip) =>
        requestData?.optin ? tip.isPersonalized : !tip.isPersonalized
      );
      return JSON.stringify(items);
    },
  },
};
