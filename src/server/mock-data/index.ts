import { ApiUrls } from '../../universal/config/api';
import { MyTip } from '../services/tips';

type MockDataConfig = Record<
  string,
  {
    method?: 'post' | 'get';
    status: number;
    responseData: any;
    timeout?: boolean;
    networkError?: boolean;
  }
>;

export const mockDataConfig: MockDataConfig = {
  [ApiUrls.BELASTINGEN]: {
    status: 200,
    responseData: () => require('./json/belasting.json'),
  },
  [ApiUrls.BRP]: {
    status: 200,
    responseData: () => require('./json/brp.json'),
  },
  [ApiUrls.WMO]: {
    status: 200,
    responseData: () => require('./json/wmo.json'),
  },
  [ApiUrls.FOCUS_AANVRAGEN]: {
    status: 200,
    responseData: () => require('./json/focus.json'),
  },
  [ApiUrls.FOCUS_SPECIFICATIES]: {
    status: 200,
    responseData: () => require('./json/inkomen-specificaties.json'),
  },
  [ApiUrls.ERFPACHT]: {
    status: 200,
    responseData: () => ({ status: true }),
  },
  [ApiUrls.BAG]: {
    status: 200,
    responseData: () => require('./json/bag.json'),
  },
  [ApiUrls.AFVAL]: {
    status: 200,
    responseData: () => require('./json/afvalophaalgebieden.json'),
  },
  [ApiUrls.MILIEUZONE]: {
    status: 200,
    responseData: () => require('./json/milieuzone.json'),
  },
  [ApiUrls.TIPS]: {
    status: 200,
    method: 'post',
    responseData: (config: any) => {
      const tips = require('./json/tips.json');
      const items = tips.items.filter((tip: MyTip) =>
        config.data?.optin ? true : !tip.isPersonalized
      );
      return Object.assign({}, tips, { items });
    },
  },
};
