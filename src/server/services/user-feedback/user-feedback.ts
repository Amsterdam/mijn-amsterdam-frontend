import { sourceApiConfig } from './user-feedback.service-config';
import type {
  SaveUserFeedbackResponse,
  Survey,
  SurveyEntry,
  UserFeedbackInput,
} from './user-feedback.types';
import { type ApiResponsePromise } from '../../../universal/helpers/api';
import { omit } from '../../../universal/helpers/utils';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';

export async function fetchUserFeedbackSurvey(
  surveyId: string
): ApiResponsePromise<Survey> {
  const requestConfig = getApiConfig('AMSAPP_SURVEY_API', sourceApiConfig, {
    formatUrl: ({ url }) => `${url}/${surveyId}/latest`,
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

  const requestConfig = getApiConfig('AMSAPP_SURVEY_API', sourceApiConfig, {
    formatUrl: ({ url }) => `${url}/${surveyId}/versions/${version}/entries`,
    method: 'POST',
    data: surveyEntryPayload,
  });
  return requestData<SaveUserFeedbackResponse>(requestConfig);
}
