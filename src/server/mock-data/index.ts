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

export function resolveWithDelay(delayMS: number = 0, data: any) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, delayMS);
  });
}

function simulateJsonResponse(data: any) {
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
    responseData: () => simulateJsonResponse(BELASTINGEN),
  },
  [ApiUrls.BRP]: {
    status: 200,
    // delay: 2500,
    responseData: () => {
      return simulateJsonResponse(BRP);
    },
  },
  [ApiUrls.WMO]: {
    status: 200,
    responseData: () => simulateJsonResponse(WMO),
  },
  [ApiUrls.FOCUS_AANVRAGEN]: {
    status: 200,
    // delay: 3400,
    responseData: () => simulateJsonResponse(FOCUS_AANVRAGEN),
  },
  [ApiUrls.FOCUS_COMBINED]: {
    status: 200,
    responseData: () => simulateJsonResponse(FOCUS_COMBINED),
  },
  [ApiUrls.ERFPACHT]: {
    status: 200,
    responseData: () => simulateJsonResponse({ status: true }),
  },
  [ApiUrls.BAG]: {
    status: 200,
    responseData: () => simulateJsonResponse(BAG),
  },
  [ApiUrls.AFVAL]: {
    status: 200,
    responseData: () => simulateJsonResponse(AFVAL),
  },
  [ApiUrls.MILIEUZONE]: {
    status: 200,
    responseData: () => simulateJsonResponse(MILIEUZONE),
  },
  [ApiUrls.TIPS]: {
    status: 200,
    method: 'post',
    responseData: (config: any) => {
      let sourceTips: MyTip[] = [];
      if (config.data?.tips?.length) {
        sourceTips = config.data.tips;
      }
      const tips = TIPS;
      const items = [
        ...(tips.items as MyTip[]),
        ...sourceTips,
      ].filter((tip: MyTip) =>
        config.data?.optin ? true : !tip.isPersonalized
      );
      return simulateJsonResponse(Object.assign({}, tips, { items }));
    },
  },
};
