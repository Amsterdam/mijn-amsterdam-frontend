import {
  sourceApiConfig,
  SURVEY_ID_INLINE_KTO,
  SURVEY_VERSION_INLINE_KTO,
} from './user-feedback.service-config';
import type {
  SaveUserFeedbackResponse,
  Survey,
  SurveyEntry,
  SurveyFrontend,
  UserFeedbackInput,
} from './user-feedback.types';
import { type ApiResponsePromise } from '../../../universal/helpers/api';
import { omit } from '../../../universal/helpers/utils';
import { getCustomApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { deepCamelizeKeys } from '../db/helper';

export async function fetchUserFeedbackSurvey(
  surveyId: string = SURVEY_ID_INLINE_KTO,
  version: string = SURVEY_VERSION_INLINE_KTO
): ApiResponsePromise<SurveyFrontend> {
  const requestConfig = getCustomApiConfig(sourceApiConfig, {
    formatUrl: ({ url }) =>
      version === 'latest'
        ? `${url}/${surveyId}/latest`
        : `${url}/${surveyId}/versions/${version}`,
    method: 'GET',
    transformResponse(survey: Survey) {
      return deepCamelizeKeys<Survey>(survey);
    },
  });
  return requestData<SurveyFrontend>(requestConfig);
}

export async function saveUserFeedback(
  surveyId: string,
  version: string,
  data: UserFeedbackInput
): ApiResponsePromise<SaveUserFeedbackResponse> {
  const metadata = omit(data, ['browser_path', 'answers']);
  if (metadata.ma_errors) {
    metadata.ma_errors = JSON.parse(metadata.ma_errors || 'null');
  }
  metadata.ma_themas = JSON.parse(metadata.ma_themas || 'null');
  if (metadata.thema_details) {
    metadata.thema_details = JSON.parse(metadata.thema_details || 'null');
  }

  const surveyEntryPayload: SurveyEntry = {
    answers: JSON.parse(data.answers),
    entry_point: data.browser_path || 'unknown',
    metadata,
  };

  const requestConfig = getCustomApiConfig(sourceApiConfig, {
    formatUrl: ({ url }) => `${url}/${surveyId}/versions/${version}/entries`,
    method: 'POST',
    data: surveyEntryPayload,
  });
  return requestData<SaveUserFeedbackResponse>(requestConfig);
}
