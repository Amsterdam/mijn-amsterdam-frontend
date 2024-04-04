import { apiSuccessResult } from '../../universal/helpers';
import { ApiUrls, oidcConfigEherkenning } from '../config';
import { decodeToken } from '../helpers/app';
// Import JSON files because they get included in the bundle this way.
// The JSON files represent the data output of the MA Python api's.
import AVG_THEMAS from './json/avg-themas.json';
import AVG from './json/avg.json';
import BELASTINGEN from './json/belasting.json';
import BEZWAREN_DOCUMENTS from './json/bezwaren-documents.json';
import BEZWAREN_STATUS from './json/bezwaren-status.json';
import BEZWAREN from './json/bezwaren.json';
import BRP from './json/brp.json';
import ERFPACHT_NOTIFICATIONS from './json/erfpacht-notifications.json';
import ERFPACHT from './json/erfpacht.json';
import ERFPACHTv2_DOSSIERS from './json/erfpacht-v2-dossiers.json';
import ERFPACHTv2_DOSSIERINFO_DETAILS from './json/erfpacht-v2-dossierinfo-bsn.json';
import ERFPACHTv2_ERFPACHTER from './json/erfpacht-v2-erfpachter.json';
import KLACHTEN from './json/klachten.json';
import KREFIA from './json/krefia.json';
import KVK1 from './json/kvk-handelsregister.json';
import KVK2 from './json/kvk-handelsregister2.json';
import LOODMETING_RAPPORT from './json/loodmeting_rapport.json';
import LOODMETINGEN from './json/loodmetingen.json';
import CLEOPATRA from './json/cleopatra.json';
import TOERISTISCHE_VERHUUR_REGISTRATIES_BSN from './json/registraties-toeristische-verhuur-bsn.json';
import TOERISTISCHE_VERHUUR_REGISTRATIE from './json/registraties-toeristische-verhuur.json';
import SIA_HISTORY from './json/sia-history.json';
import SIA_ATTACHMENTS from './json/sia-melding-attachments.json';
import SIA from './json/sia-meldingen.json';
import SIA_MELDINGEN_BUURT from './json/sia-meldingen-buurt.json';
import SUBSIDIE from './json/subsidie.json';
import VERGUNNINGEN from './json/vergunningen.json';
import WMO from './json/wmo.json';
import WPI_AANVRAGEN from './json/wpi-aanvragen.json';
import WPI_E_AANVRAGEN from './json/wpi-e-aanvragen.json';
import WPI_SPECIFICATIES from './json/wpi-specificaties.json';
import SVWI from './json/svwi.json';
import GPASS_PASHOUDERS from './json/gpass-pashouders.json';
import GPASS_STADSPAS from './json/gpass-stadspas.json';
import GPASS_TRANSACTIES from './json/gpass-transacties.json';
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

async function loadMockApiResponseJson(data: any) {
  return JSON.stringify(data);
}

function isCommercialUser(config: any) {
  const authHeader = config?.headers.Authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const tokenData = decodeToken(authHeader.split('Bearer ').pop()) as {
        aud: string;
      };
      return tokenData?.aud === oidcConfigEherkenning.clientID;
    } catch (error) {
      // Don't do anything here. For Dev purposes we just try-and-decode and see if we recognize the content of the token. Nothing fancy.
    }
  }

  return false;
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
  [String(ApiUrls.BELASTINGEN)]: {
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      return loadMockApiResponseJson(BELASTINGEN);
    },
  },
  [String(ApiUrls.BRP)]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    // delay: 2500,
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return loadMockApiResponseJson(BRP);
    },
  },
  [String(ApiUrls.BEZWAREN_LIST)]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    // delay: 2500,
    method: 'post',
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return loadMockApiResponseJson(BEZWAREN);
    },
  },
  [String(ApiUrls.BEZWAREN_DOCUMENTS)]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    // delay: 2500,
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return loadMockApiResponseJson(BEZWAREN_DOCUMENTS);
    },
  },
  [String(ApiUrls.BEZWAREN_STATUS)]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    // delay: 2500,
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return loadMockApiResponseJson(BEZWAREN_STATUS);
    },
  },
  [`${ApiUrls.ZORGNED}`]: {
    method: 'post',
    pathReg: new RegExp('/remote/zorgned/*'),
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return loadMockApiResponseJson(WMO);
    },
  },
  [String(ApiUrls.WPI_AANVRAGEN)]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    // delay: 3400,
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return loadMockApiResponseJson(WPI_AANVRAGEN);
    },
  },
  [String(ApiUrls.WPI_E_AANVRAGEN)]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return loadMockApiResponseJson(WPI_E_AANVRAGEN);
    },
  },
  [String(ApiUrls.GPASS)]: {
    pathReg: new RegExp('/remote/gpass/*'),
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      if (config.url.includes('sales/v1/pashouder')) {
        return loadMockApiResponseJson(GPASS_PASHOUDERS);
      }
      if (config.url.includes('sales/v1/pas')) {
        return loadMockApiResponseJson(GPASS_STADSPAS);
      }
      if (config.url.includes('transacties/v1/budget')) {
        return loadMockApiResponseJson(GPASS_TRANSACTIES);
      }
      return null;
    },
  },
  [String(ApiUrls.WPI_SPECIFICATIES)]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return loadMockApiResponseJson(WPI_SPECIFICATIES);
    },
  },
  [String(ApiUrls.SVWI)]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return 'no-content';
      }
      return loadMockApiResponseJson(SVWI);
    },
  },
  [String(ApiUrls.ERFPACHTv2)]: {
    pathReg: new RegExp('/remote/erfpachtv2/*'),
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      if (config.url.includes('dossierinfo/')) {
        return loadMockApiResponseJson(ERFPACHTv2_DOSSIERINFO_DETAILS);
      }
      if (config.url.includes('dossierinfo')) {
        return loadMockApiResponseJson(ERFPACHTv2_DOSSIERS);
      }
      return loadMockApiResponseJson(ERFPACHTv2_ERFPACHTER);
    },
  },
  [String(ApiUrls.ERFPACHT)]: {
    pathReg: new RegExp('/remote/erfpacht/*'),
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      if (config.url.includes('/notifications/')) {
        return loadMockApiResponseJson(ERFPACHT_NOTIFICATIONS);
      }
      return loadMockApiResponseJson(ERFPACHT);
    },
  },
  [String(ApiUrls.SUBSIDIE)]: {
    pathReg: new RegExp('/remote/subsidies/*'),
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      return loadMockApiResponseJson(SUBSIDIE);
    },
  },
  [`${ApiUrls.SIA}`]: {
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      if (config.params.status.includes('ingepland')) {
        return loadMockApiResponseJson(SIA);
      }
      return loadMockApiResponseJson([]);
    },
  },
  [`${ApiUrls.SIA}:id/attachments`]: {
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      return loadMockApiResponseJson(SIA_ATTACHMENTS);
    },
  },
  [`${ApiUrls.SIA}:id/history`]: {
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      return loadMockApiResponseJson(SIA_HISTORY);
    },
  },
  ['https://acc.api.meldingen.amsterdam.nl/signals/v1/public/signals/geography?bbox=4.705770%2C52.256977%2C5.106206%2C52.467268&geopage=1']:
    {
      status: (config: any) => (isCommercialUser(config) ? 200 : 200),
      responseData: async (config: any) => {
        return loadMockApiResponseJson({
          features: [SIA_MELDINGEN_BUURT.features[0]],
        });
      },
      headers: {
        link: '<https://acc.api.meldingen.amsterdam.nl/signals/v1/public/signals/geography?bbox=4.705770%2C52.256977%2C5.106206%2C52.467268&geopage=2>; rel="next"',
      },
    },
  ['https://acc.api.meldingen.amsterdam.nl/signals/v1/public/signals/geography?bbox=4.705770%2C52.256977%2C5.106206%2C52.467268&geopage=2']:
    {
      status: (config: any) => (isCommercialUser(config) ? 200 : 200),
      responseData: async (config: any) => {
        return loadMockApiResponseJson({
          features: [SIA_MELDINGEN_BUURT.features[1]],
        });
      },
      headers: {
        link: '<https://acc.api.meldingen.amsterdam.nl/signals/v1/public/signals/geography?bbox=4.705770%2C52.256977%2C5.106206%2C52.467268&geopage=3>; rel="next"',
      },
    },
  ['https://acc.api.meldingen.amsterdam.nl/signals/v1/public/signals/geography?bbox=4.705770%2C52.256977%2C5.106206%2C52.467268&geopage=3']:
    {
      status: (config: any) => (isCommercialUser(config) ? 200 : 200),
      responseData: async (config: any) => {
        return loadMockApiResponseJson({
          features: [SIA_MELDINGEN_BUURT.features[2]],
        });
      },
    },
  [String(process.env.BFF_SIA_IAM_TOKEN_ENDPOINT)]: {
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    method: 'post',
    responseData: async (config: any) => {
      return loadMockApiResponseJson({
        access_token: 'xxxx',
      });
    },
  },
  // [String(ApiUrls.AFVAL)]: {
  //   status: (config: any) => (isCommercialUser(config) ? 200 : 200),
  //   responseData: async (config: any) => {
  //     // if (isCommercialUser(config)) {
  //     //   return 'no-content';
  //     // }
  //     return loadMockApiResponseJson(AFVAL);
  //   },
  // },
  [String(ApiUrls.CLEOPATRA)]: {
    method: 'post',
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      return loadMockApiResponseJson(CLEOPATRA);
    },
  },
  [String(ApiUrls.VERGUNNINGEN)]: {
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        const vergunningenCommercial = VERGUNNINGEN.content.filter(
          (vergunning) => {
            // NOTE: Never a commercial permit.
            return ![
              'Vakantieverhuur vergunningsaanvraag',
              'Parkeerontheffingen Blauwe zone particulieren',
            ].includes(vergunning.caseType);
          }
        );
        return loadMockApiResponseJson(
          apiSuccessResult(vergunningenCommercial)
        );
      }
      return loadMockApiResponseJson(VERGUNNINGEN);
    },
  },

  [String(ApiUrls.KVK)]: {
    // delay: 12000,
    status: (config: any) => (isCommercialUser(config) ? 200 : 200),
    responseData: async (config: any) => {
      if (isCommercialUser(config)) {
        return loadMockApiResponseJson(KVK2);
      }
      return loadMockApiResponseJson(KVK1);
    },
  },
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
  [String(ApiUrls.TOERISTISCHE_VERHUUR_REGISTRATIES + '/:number')]: {
    status: (config: any) => (isCommercialUser(config) ? 500 : 200),
    responseData: async (config: any) => {
      // if (isCommercialUser(config)) {
      //   return loadMockApiResponseJson(TOERISTISCHE_VERHUUR_REGISTRATIES);
      // }
      return loadMockApiResponseJson({
        ...TOERISTISCHE_VERHUUR_REGISTRATIE,
        registrationNumber: config.url.split('/').pop(),
      });
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
        asymmetricMatch: function (actual: any) {
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
        asymmetricMatch: function (actual: any) {
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
        asymmetricMatch: function (actual: any) {
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
  [`${ApiUrls.CMS_MAINTENANCE_NOTIFICATIONS}`]: {
    status: () => 200,
    method: 'get',
    responseData: async (config: any) => {
      return loadMockApiResponseJson(MAINTENANCE_NOTIFICATIONS_ALLE);
    },
  },
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
