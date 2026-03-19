import { isEnabled } from '../../config/azure-appconfiguration.ts';
import type { DataRequestConfig } from '../../config/source-api.ts';
import { getFromEnv } from '../../helpers/env.ts';

export const routes = {
  protected: {
    USER_FEEDBACK_SUBMIT: '/user-feedback/collect',
    USER_FEEDBACK_SURVEY: '/user-feedback/survey',
  },
  admin: {
    USER_FEEDBACK_OVERVIEW_TABLE: '/admin/user-feedback/overview/table',
    USER_FEEDBACK_OVERVIEW: '/admin/user-feedback/overview',
  },
};

const isUserfeedbackEnabled =
  getFromEnv('BFF_USER_FEEDBACK_ENABLED') === 'true';

export const featureToggle = {
  router: {
    protected: {
      isEnabled: isUserfeedbackEnabled,
    },
    admin: {
      isEnabled: isUserfeedbackEnabled,
    },
  },
  service: {
    fetchSurvey: {
      isEnabled: isEnabled('USER_FEEDBACK.fetchSurvey'),
    },
  },
};

export const sourceApiConfig: DataRequestConfig = {
  url: `${process.env.BFF_AMSAPP_SURVEY_API_BASE_URL}`,
  method: 'POST',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'x-api-key': getFromEnv('BFF_AMSAPP_SURVEY_API_KEY'),
  },
} as const;

export const SURVEY_ID_INLINE_KTO =
  getFromEnv('BFF_USER_FEEDBACK_SURVEY_ID', false) || 'mams-inline-kto';

export const SURVEY_VERSION_INLINE_KTO =
  getFromEnv('BFF_USER_FEEDBACK_SURVEY_VERSION', false) || 'latest';
