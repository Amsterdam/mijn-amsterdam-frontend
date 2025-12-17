import { IS_OT, IS_PRODUCTION } from '../../../universal/config/env';

export const featureToggle = {
  router: {
    private: {
      isEnabled: !IS_PRODUCTION,
    },
  },
  termijnFacturenActive: true,
  // Display of phone number is not needed atm.
  businesspartnerPhoneActive: false,
  // We don't filter out the undownloadable facturen for testing purposes.
  // We want to be able to test immediately and not wait until the evening.
  filterOutUndownloadableFacturenActive: IS_OT || IS_PRODUCTION,
} as const;

export const routes = {
  private: {
    // This endpoint is reached over the private network from the EnableU network.
    // It's used to notify us about the status of e-mandate signing requests. Sent by the Payment Service Provider.
    // The requesting side is allways a server side request from the PSP.
    AFIS_EMANDATE_SIGN_REQUEST_STATUS_NOTIFY: `/services/afis/e-mandates/sign-request-status-notify`,
  },
  protected: {
    AFIS_BUSINESSPARTNER: '/services/afis/businesspartner',
    AFIS_EMANDATES: '/services/afis/e-mandates',
    AFIS_EMANDATES_DEACTIVATE: '/services/afis/e-mandates/deactivate',
    AFIS_EMANDATES_SIGN_REQUEST_URL:
      '/services/afis/e-mandates/sign-request-url',
    AFIS_EMANDATES_UPDATE_LIFETIME: '/services/afis/e-mandates/update-lifetime',
    AFIS_EMANDATES_SIGN_REQUEST_STATUS_NOTIFICATION:
      '/services/afis/e-mandates/sign-request-notification',
    AFIS_FACTUREN: '/services/afis/facturen/:state',
    AFIS_DOCUMENT_DOWNLOAD: '/services/afis/facturen/document',
  },
} as const;
