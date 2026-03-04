import {
  featureToggle,
  sourceApiConfig,
  SURVEY_ID_INLINE_KTO,
  SURVEY_VERSION_INLINE_KTO,
} from './user-feedback.service-config';
import type {
  SaveUserFeedbackResponse,
  Survey,
  SurveyEntriesResponse,
  SurveyEntryFrontend,
  SurveyEntryPayload,
  SurveyFrontend,
  SurveyOverviewFrontend,
  UserFeedbackInput,
} from './user-feedback.types';
import {
  apiErrorResult,
  apiSuccessResult,
  getFailedDependencies,
  type ApiResponsePromise,
} from '../../../universal/helpers/api';
import { omit, pick } from '../../../universal/helpers/utils';
import { getCustomApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { deepCamelizeKeys } from '../db/helper';

export async function fetchUserFeedbackSurvey(
  surveyId: Survey['unique_code'] = SURVEY_ID_INLINE_KTO,
  version: string = SURVEY_VERSION_INLINE_KTO,
  enableCache: boolean = true
): ApiResponsePromise<SurveyFrontend> {
  const requestConfig = getCustomApiConfig(sourceApiConfig, {
    formatUrl: ({ url }) =>
      version === 'latest'
        ? `${url}/${surveyId}/latest`
        : `${url}/${surveyId}/versions/${version}`,
    method: 'GET',
    enableCache,
    transformResponse(survey: Survey) {
      const base = pick(deepCamelizeKeys<Survey>(survey), [
        'id',
        'version',
        'title',
        'description',
        'createdAt',
        'activeFrom',
        'uniqueCode',
      ]);

      return {
        ...base,
        questions: survey.questions?.map((question) => {
          return (
            pick(deepCamelizeKeys(question), [
              'id',
              'maxCharacters',
              'questionText',
              'questionType',
              'required',
              'description',
            ]) ?? []
          );
        }),
      };
    },
    postponeFetch: !featureToggle.service.fetchSurvey.isEnabled,
  });
  return requestData<SurveyFrontend>(requestConfig);
}

function getSurveyEntryPayload(data: UserFeedbackInput): SurveyEntryPayload {
  const metadata = omit(data, ['browserPath', 'answers']);
  if (metadata.maErrors) {
    metadata.maErrors = JSON.parse(metadata.maErrors || 'null');
  }
  metadata.maThemas = JSON.parse(metadata.maThemas || 'null');
  if (metadata.pageDetails) {
    metadata.pageDetails = JSON.parse(metadata.pageDetails || 'null');
  }

  const surveyEntryPayload: SurveyEntryPayload = {
    answers: JSON.parse(data.answers),
    entry_point: data.browserPath || 'unknown',
    metadata,
  };

  return surveyEntryPayload;
}

export async function saveUserFeedback(
  surveyId: Survey['unique_code'],
  version: string,
  data: UserFeedbackInput
): ApiResponsePromise<SaveUserFeedbackResponse> {
  const surveyEntryPayload = getSurveyEntryPayload(data);

  const requestConfig = getCustomApiConfig(sourceApiConfig, {
    formatUrl: ({ url }) => `${url}/${surveyId}/versions/${version}/entries`,
    method: 'POST',
    data: surveyEntryPayload,
    enableCache: false,
  });

  return requestData<SaveUserFeedbackResponse>(requestConfig);
}

async function fetchFeedbackSurveyEntries(
  surveyId: Survey['unique_code'],
  page: number = 1
): ApiResponsePromise<{ entries: SurveyEntryFrontend[]; pageCount: number }> {
  const PAGE_SIZE = 100;
  const requestConfig = getCustomApiConfig(sourceApiConfig, {
    formatUrl: ({ url }) => `${url}/entries`,
    method: 'GET',
    params: {
      page_size: PAGE_SIZE,
      page,
    },
    enableCache: false,
    transformResponse(entriesResponse: SurveyEntriesResponse) {
      const entriesBySurvey = entriesResponse.results.filter((entry) => {
        return entry.survey_unique_code === surveyId;
      });
      const entries = entriesBySurvey.map((entry) => {
        return {
          answers: Object.fromEntries(
            entry.answers.map((answer) => [answer.question, answer.answer])
          ),
          dateCreated: entry.created_at,
          metadata: entry.metadata,
          entryPoint: entry.entry_point,
        };
      });

      return {
        entries,
        pageCount: Math.ceil(entriesResponse.count / PAGE_SIZE),
      };
    },
  });

  return requestData<{ entries: SurveyEntryFrontend[]; pageCount: number }>(
    requestConfig
  );
}

export async function userFeedbackOverview(
  surveyId: Survey['unique_code'],
  version: string,
  page: number = 1
): ApiResponsePromise<SurveyOverviewFrontend> {
  const USE_CACHE = false;
  const surveyRequest = fetchUserFeedbackSurvey(surveyId, version, USE_CACHE);
  const entriesRequest = fetchFeedbackSurveyEntries(surveyId, page);

  const [surveyResponse, entriesResponse] = await Promise.all([
    surveyRequest,
    entriesRequest,
  ]);

  if (!surveyResponse.content || !entriesResponse.content) {
    return apiErrorResult(
      'Failed to fetch user feedback overview data',
      null,
      500
    );
  }

  const survey = surveyResponse.content;
  const questionsById = Object.fromEntries(
    survey.questions.map((question) => {
      return [question.id, question.questionText];
    })
  );

  return apiSuccessResult(
    {
      survey: {
        title: survey.title ?? 'Untitled survey',
        questions: questionsById,
      },
      entries: entriesResponse.content.entries.toSorted((a, b) =>
        b.dateCreated.localeCompare(a.dateCreated)
      ),
      pageCount: entriesResponse.content.pageCount,
    },
    getFailedDependencies({
      survey: surveyResponse,
    })
  );
}
