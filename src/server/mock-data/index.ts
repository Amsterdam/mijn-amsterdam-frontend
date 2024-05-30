import { ApiUrls, oidcConfigEherkenning } from '../config';
import { decodeToken } from '../helpers/app';
// Import JSON files because they get included in the bundle this way.
// The JSON files represent the data output of the MA Python api's.
import AVG_THEMAS from './json/avg-themas.json';
import AVG from './json/avg.json';
import KLACHTEN from './json/klachten.json';
import KREFIA from './json/krefia.json';
import LOODMETING_RAPPORT from './json/loodmeting_rapport.json';
import LOODMETINGEN from './json/loodmetingen.json';
import TOERISTISCHE_VERHUUR_REGISTRATIES_BSN from './json/registraties-toeristische-verhuur-bsn.json';
import POWERBROWSER_BB_VERGUNNINGEN from './json/powerbrowser-bb-vergunningen.json';
import POWERBROWSER_BB_VERGUNNING_STATUS from './json/powerbrowser-bb-vergunning-status.json';
import POWERBROWSER_BB_VERGUNNING_ATTACHMENTS from './json/powerbrowser-bb-attachments.json';

import MAINTENANCE_NOTIFICATIONS_ALLE from './json/maintenance-notifications-alle.json';
import MAINTENANCE_NOTIFICATIONS_DASHBOARD from './json/maintenance-notifications-dashboard.json';
import MAINTENANCE_NOTIFICATIONS_LANDINGSPAGE from './json/maintenance-notifications-landingspagina.json';

export function resolveWithDelay(delayMS: number = 0, data: any) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delayMS);
  });
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
  [String(ApiUrls.POWERBROWSER)]: [
    {
      method: 'get',
      pathReg: new RegExp('/remote/powerbrowser/*'),
      status: (config: any) => (isCommercialUser(config) ? 500 : 200),
      responseData: async (config: any) => {
        switch (true) {
          case config.url.includes('/Link/GFO_ZAKEN'):
            return loadMockApiResponseJson(
              POWERBROWSER_BB_VERGUNNING_ATTACHMENTS
            );
          case config.url.includes('/Dms/'):
            return loadMockApiResponseJson(
              POWERBROWSER_BB_VERGUNNING_ATTACHMENTS
            );
        }
        return loadMockApiResponseJson(null);
      },
    },
    {
      method: 'post',
      pathReg: new RegExp('/remote/powerbrowser/*'),
      status: (config: any) => (isCommercialUser(config) ? 500 : 200),
      responseData: async (config: any) => {
        if (config.url.includes('/Token')) {
          return loadMockApiResponseJson('xxxx-909090-yyyy');
        }
        return loadMockApiResponseJson(POWERBROWSER_BB_VERGUNNINGEN);
      },
    },
  ],
  [String(ApiUrls.TOERISTISCHE_VERHUUR_REGISTRATIES + '/bsn')]: {
    method: 'post',
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      // if (isCommercialUser(config)) {
      //   return loadMockApiResponseJson(TOERISTISCHE_VERHUUR_REGISTRATIES);
      // }
      return loadMockApiResponseJson(TOERISTISCHE_VERHUUR_REGISTRATIES_BSN);
    },
  },
  [String(ApiUrls.KREFIA)]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      // if (isCommercialUser(config)) {
      //   return loadMockApiResponseJson(KREFIA);
      // }
      return loadMockApiResponseJson(KREFIA);
    },
  },
  [String(ApiUrls.ENABLEU_2_SMILE)]: [
    {
      status: (config: any) => (isCommercialUser(config) ? 500 : 200),
      method: 'post',
      responseData: async (config: any) => {
        return loadMockApiResponseJson(KLACHTEN);
      },
      params: {
        asymmetricMatch: function(actual: any) {
          return actual.getBuffer().toString().includes('readKlacht');
        },
      },
    },
    {
      status: (config: any) => (isCommercialUser(config) ? 500 : 200),
      method: 'post',
      responseData: async (config: any) => {
        return loadMockApiResponseJson(AVG);
      },
      params: {
        asymmetricMatch: function(actual: any) {
          return actual.getBuffer().toString().includes('readAVGverzoek');
        },
      },
    },
    {
      status: (config: any) => (isCommercialUser(config) ? 500 : 200),
      method: 'post',
      responseData: async (config: any) => {
        return loadMockApiResponseJson(AVG_THEMAS);
      },
      params: {
        asymmetricMatch: function(actual: any) {
          return actual
            .getBuffer()
            .toString()
            .includes('readthemaperavgverzoek');
        },
      },
    },
  ],
  [`${ApiUrls.LOOD_365}/be_getrequestdetails`]: {
    status: () => 200,
    method: 'post',
    responseData: async (config: any) => {
      return loadMockApiResponseJson(LOODMETINGEN);
    },
  },
  [`${ApiUrls.LOOD_365}/be_downloadleadreport`]: {
    status: () => 200,
    method: 'post',
    responseData: async (config: any) => {
      return loadMockApiResponseJson(LOODMETING_RAPPORT);
    },
  },
  [`${ApiUrls.LOOD_365_OAUTH}`]: {
    status: () => 200,
    method: 'post',
    responseData: async (config: any) => {
      return loadMockApiResponseJson({ access_token: 'foo-bar' });
    },
  },
  //
  [`${ApiUrls.CMS_MAINTENANCE_NOTIFICATIONS}`]: {
    status: () => 200,
    method: 'get',
    responseData: async (config: any) => {
      // RP TODO: URLS in MAINTENANCE_NOTIFICATIONS_ALLE in localhost veranderen. Dat heeft geen invloed op productie
      return loadMockApiResponseJson(MAINTENANCE_NOTIFICATIONS_ALLE);
    },
  },
  // RP TODO: Deze en die hieronder vervangen met een env variable (.env.local)
  ['https://www.amsterdam.nl/storingsmeldingen/alle-meldingen-mijn-amsterdam/dashboard/?Appidt=app-pagetype&reload=true']:
  {
    status: () => 200,
    method: 'get',
    responseData: async (config: any) => {
      return loadMockApiResponseJson(MAINTENANCE_NOTIFICATIONS_DASHBOARD);
    },
  },
  ['https://www.amsterdam.nl/storingsmeldingen/alle-meldingen-mijn-amsterdam/landingspagina/?Appidt=app-pagetype&reload=true']:
  {
    status: () => 200,
    method: 'get',
    responseData: async (config: any) => {
      return loadMockApiResponseJson(MAINTENANCE_NOTIFICATIONS_LANDINGSPAGE);
    },
  },
};
