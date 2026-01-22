import { IS_PRODUCTION } from '../../../universal/config/env';
import type { DataRequestConfig } from '../../config/source-api';
import { getFromEnv } from '../../helpers/env';

export const routes = {
  protected: {
    USER_FEEDBACK_SUBMIT: '/user-feedback/collect',
    USER_FEEDBACK_SURVEY: '/user-feedback/survey',
  },
};

export const featureToggle = {
  router: {
    protected: {
      isEnabled: !IS_PRODUCTION,
    },
  },
  service: {
    fetchSurvey: {
      isEnabled: getFromEnv('BFF_USER_FEEDBACK_ENABLED') === 'true',
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

export const SURVEY_ID_INLINE_KTO = 'mams-inline-kto';
export const SURVEY_VERSION_INLINE_KTO = '1';
