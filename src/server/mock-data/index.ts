import { MyTip } from '../../universal/types';
import { ApiUrls } from '../config';

import BELASTINGEN from './json/belasting.json';
import BRP from './json/brp.json';
import WMO from './json/wmo.json';
import FOCUS_AANVRAGEN from './json/focus-aanvragen.json';
import FOCUS_COMBINED from './json/focus-combined.json';
import BAG from './json/bag.json';
import AFVAL from './json/afvalophaalgebieden.json';
import MILIEUZONE from './json/milieuzone.json';
import TIPS from './json/tips.json';
import AMSTERDAM_CONTENT from './json/amsterdam-nl-content-uitleg.json';

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
  }
>;

export const mockDataConfig: MockDataConfig = {
  [ApiUrls.BELASTINGEN]: {
    status: 200,
    responseData: async () => await loadMockApiResponseJson(BELASTINGEN),
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
    responseData: async () => await JSON.stringify({ status: true }),
  },
  [ApiUrls.BAG]: {
    status: 200,
    responseData: async () => await loadMockApiResponseJson(BAG),
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
    responseData: async () => await loadMockApiResponseJson(AMSTERDAM_CONTENT),
  },
  [ApiUrls.TIPS]: {
    status: 200,
    method: 'post',
    responseData: async (config: any) => {
      const requestData = JSON.parse(config.data);
      let sourceTips: MyTip[] = [];
      if (requestData?.tips?.length) {
        sourceTips = requestData.tips;
      }
      const content = await loadMockApiResponseJson(TIPS);
      const tips = JSON.parse(content);
      const items = [
        ...(tips.items as MyTip[]),
        ...sourceTips,
      ].filter((tip: MyTip) =>
        requestData?.optin ? tip.isPersonalized : !tip.isPersonalized
      );
      return JSON.stringify(Object.assign({}, tips, { items }));
    },
  },
};
