import { MyTip } from '../../universal/types';
import { ApiUrls } from '../config';

import BELASTINGEN from './json/belasting.json';
import BRP from './json/brp.json';
import WMO from './json/wmo.json';
import FOCUS_AANVRAGEN from './json/focus.json';
import FOCUS_SPECIFICATIES from './json/inkomen-specificaties.json';
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
    responseData: () => BELASTINGEN,
  },
  [ApiUrls.BRP]: {
    status: 200,
    // delay: 2500,
    responseData: () => {
      return BRP;
    },
  },
  [ApiUrls.WMO]: {
    status: 200,
    responseData: () => WMO,
  },
  [ApiUrls.FOCUS_AANVRAGEN]: {
    status: 200,
    // delay: 3400,
    responseData: () => FOCUS_AANVRAGEN,
  },
  [ApiUrls.FOCUS_SPECIFICATIES]: {
    status: 200,
    responseData: () => FOCUS_SPECIFICATIES,
  },
  [ApiUrls.ERFPACHT]: {
    status: 200,
    responseData: () => ({ status: true }),
  },
  [ApiUrls.BAG]: {
    status: 200,
    responseData: () => BAG,
  },
  [ApiUrls.AFVAL]: {
    status: 200,
    responseData: () => AFVAL,
  },
  [ApiUrls.MILIEUZONE]: {
    status: 200,
    responseData: () => MILIEUZONE,
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
      return Object.assign({}, tips, { items });
    },
  },
};
