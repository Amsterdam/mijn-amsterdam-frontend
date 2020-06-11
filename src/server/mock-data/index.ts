import { MyTip } from '../../universal/types';
import { ApiUrls } from '../config';
import { readFileSync } from 'fs';
import path from 'path';

const BELASTINGEN = './json/belasting.json';
const BRP = './json/brp.json';
const WMO = './json/wmo.json';
const FOCUS_AANVRAGEN = './json/focus-aanvragen.json';
const FOCUS_COMBINED = './json/focus-combined.json';
const BAG = './json/bag.json';
const AFVAL = './json/afvalophaalgebieden.json';
const MILIEUZONE = './json/milieuzone.json';
const TIPS = './json/tips.json';

export function resolveWithDelay(delayMS: number = 0, data: any) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(data);
    }, delayMS);
  });
}

function loadMockApiResponseJson(fileName: string) {
  return readFileSync(path.join(__dirname, fileName), {
    encoding: 'utf8',
  }).toString();
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
    responseData: () => loadMockApiResponseJson(BELASTINGEN),
  },
  [ApiUrls.BRP]: {
    status: 200,
    // delay: 2500,
    responseData: () => {
      return loadMockApiResponseJson(BRP);
    },
  },
  [ApiUrls.WMO]: {
    status: 200,
    responseData: () => loadMockApiResponseJson(WMO),
  },
  [ApiUrls.FOCUS_AANVRAGEN]: {
    status: 200,
    // delay: 3400,
    responseData: () => loadMockApiResponseJson(FOCUS_AANVRAGEN),
  },
  [ApiUrls.FOCUS_COMBINED]: {
    status: 200,
    responseData: () => loadMockApiResponseJson(FOCUS_COMBINED),
  },
  [ApiUrls.ERFPACHT]: {
    status: 200,
    responseData: () => JSON.stringify({ status: true }),
  },
  [ApiUrls.BAG]: {
    status: 200,
    responseData: () => loadMockApiResponseJson(BAG),
  },
  [ApiUrls.AFVAL]: {
    status: 200,
    responseData: () => loadMockApiResponseJson(AFVAL),
  },
  [ApiUrls.MILIEUZONE]: {
    status: 200,
    responseData: () => loadMockApiResponseJson(MILIEUZONE),
  },
  [ApiUrls.TIPS]: {
    status: 200,
    method: 'post',
    responseData: (config: any) => {
      let sourceTips: MyTip[] = [];
      if (config.data?.tips?.length) {
        sourceTips = config.data.tips;
      }
      const tips = JSON.parse(loadMockApiResponseJson(TIPS));
      const items = [
        ...(tips.items as MyTip[]),
        ...sourceTips,
      ].filter((tip: MyTip) =>
        config.data?.optin ? true : !tip.isPersonalized
      );
      return JSON.stringify(Object.assign({}, tips, { items }));
    },
  },
};
