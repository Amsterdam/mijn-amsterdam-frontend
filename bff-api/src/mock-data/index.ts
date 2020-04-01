import { ApiUrls } from '../config/app';

type MockDataConfig = Record<
  string,
  {
    method?: 'post' | 'get';
    status: number;
    responseData: any;
  }
>;

export const mockDataConfig: MockDataConfig = {
  [ApiUrls.BELASTING]: {
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
  [ApiUrls.FOCUS]: {
    status: 200,
    responseData: () => require('./json/focus.json'),
  },
  [ApiUrls.FOCUS_INKOMEN_SPECIFICATIES]: {
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
    responseData: () => require('./json/tips.json'),
  },
};
