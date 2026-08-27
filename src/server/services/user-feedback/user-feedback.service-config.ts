import { isEnabled } from '../../config/azure-appconfiguration.ts';
import type { DataRequestConfig } from '../../config/source-api.ts';
import { getFromEnv } from '../../helpers/env.ts';

export const routes = {
  protected: {
    USER_FEEDBACK_SUBMIT: '/user-feedback/collect',
    USER_FEEDBACK_SURVEY: '/user-feedback/survey',
  },
  admin: {
    USER_FEEDBACK_OVERVIEW: '/user-feedback/overview',
    USER_FEEDBACK_HANDOFF_CONFIG: '/user-feedback/handoff-config',
    USER_FEEDBACK_CREATE_TICKET: '/user-feedback/:entryId/create-ticket',
    USER_FEEDBACK_DELETE_TICKET: '/user-feedback/:entryId/delete-ticket',
    USER_FEEDBACK_HANDOFF_DEPARTMENT:
      '/user-feedback/:entryId/handoff-department',
  },
};

export const featureToggle = {
  router: {
    protected: {
      isEnabled: isEnabled('USER_FEEDBACK.router.protected'),
    },
    admin: {
      isEnabled: isEnabled('USER_FEEDBACK.router.admin'),
    },
  },
  service: {
    fetchSurvey: {
      isEnabled: isEnabled('USER_FEEDBACK.fetchSurvey'),
    },
  },
};

export const sourceApiConfigSurvey: DataRequestConfig = {
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
