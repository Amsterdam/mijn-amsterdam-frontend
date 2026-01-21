import {
  sourceApiConfig,
  SURVEY_ID_INLINE_KTO,
} from './user-feedback.service-config';
import type {
  SaveUserFeedbackResponse,
  Survey,
  SurveyEntry,
  SurveyResponseLatest,
  UserFeedbackInput,
} from './user-feedback.types';
import { type ApiResponsePromise } from '../../../universal/helpers/api';
import { omit } from '../../../universal/helpers/utils';
import { getCustomApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

export async function fetchLatestUserFeedbackSurvey(
  surveyId: string = SURVEY_ID_INLINE_KTO
): ApiResponsePromise<Survey> {
  const requestConfig = getCustomApiConfig(sourceApiConfig, {
    formatUrl: ({ url }) => `${url}/${surveyId}/latest`,
    method: 'GET',
    transformResponse(data: SurveyResponseLatest[]) {
      return data?.[0]?.latest_version;
    },
  });
  return requestData<Survey>(requestConfig);
}

export async function saveUserFeedback(
  surveyId: string,
  version: string,
  data: UserFeedbackInput
): ApiResponsePromise<SaveUserFeedbackResponse> {
  const surveyEntryPayload: SurveyEntry = {
    answers: JSON.parse(data.answers),
    entry_point: data['browser.path'] || 'unknown',
    metadata: JSON.stringify(omit(data, ['browser.path', 'answers'])),
  };
  console.dir(surveyEntryPayload);

  const requestConfig = getCustomApiConfig(sourceApiConfig, {
    formatUrl: ({ url }) => `${url}/${surveyId}/versions/${version}/entries`,
    method: 'POST',
    data: surveyEntryPayload,
  });
  return requestData<SaveUserFeedbackResponse>(requestConfig);
}
