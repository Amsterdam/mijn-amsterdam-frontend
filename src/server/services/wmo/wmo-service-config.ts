import { IS_PRODUCTION } from '../../../universal/config/env';

export const featureToggle = {
  router: {
    private: {
      isEnabled: !IS_PRODUCTION,
    },
  },
};

export const routes = {
  private: {
    WMO_VOORZIENINGEN: `/services/wmo/voorzieningen`,
  },
  protected: {
    WMO_DOCUMENT_DOWNLOAD: `/services/wmo/document`,
    WMO_DOCUMENTS_LIST_RAW: `/services/wmo/raw/documents`,
    WMO_AANVRAGEN_RAW: `/services/wmo/raw/aanvragen`,
  },
};
