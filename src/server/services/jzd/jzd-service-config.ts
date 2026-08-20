import { isEnabled } from '../../config/azure-appconfiguration.ts';

export const featureToggle = {
  service: {
    fetchCasusAanvragen: {
      isEnabled: true,
    },
    fetchWmo: {
      // Add Zorgned aanvragen api props to the MA frontend output.
      addMaVoorzieningenApiProps: isEnabled(
        'WMO.fetchWmo.addMaVoorzieningenApiProps'
      ),
    },
  },
} as const;

export const routes = {
  protected: {
    WMO_DOCUMENT_DOWNLOAD: `/services/wmo/document`,
    WMO_DOCUMENTS_LIST_RAW: `/services/wmo/raw/documents`,
    WMO_AANVRAGEN_RAW: `/services/wmo/raw/aanvragen`,
    LLV_DOCUMENT_DOWNLOAD: `/services/llv/document`,
  },
} as const;
