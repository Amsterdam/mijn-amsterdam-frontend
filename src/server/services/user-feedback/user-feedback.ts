import { getUserFeedbackMetaByEntryIds } from './user-feedback-meta.model.ts';
import {
  featureToggle,
  sourceApiConfigSurvey,
  SURVEY_ID_INLINE_KTO,
  SURVEY_VERSION_INLINE_KTO,
} from './user-feedback.service-config.ts';
import type {
  FeedbackSurveyEntries,
  SaveUserFeedbackResponse,
  Survey,
  SurveyEntriesResponse,
  SurveyEntryFrontend,
  SurveyEntryPayload,
  SurveyFrontend,
  SurveyOverviewFrontend,
  UserFeedbackInput,
} from './user-feedback.types.ts';
import {
  apiErrorResult,
  apiSuccessResult,
  getFailedDependencies,
  type ApiResponsePromise,
} from '../../../universal/helpers/api.ts';
import { defaultDateTimeFormat } from '../../../universal/helpers/date.ts';
import { isNumeric, omit, pick } from '../../../universal/helpers/utils.ts';
import { camelize } from '../../helpers/camelize.ts';
import { getCustomApiConfig } from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';
import { IS_DB_ENABLED } from '../db/config.ts';
import { captureMessage } from '../monitoring.ts';

export async function fetchUserFeedbackSurvey(
  surveyId: Survey['unique_code'] = SURVEY_ID_INLINE_KTO,
  version: string = SURVEY_VERSION_INLINE_KTO,
  enableCache: boolean = true
): ApiResponsePromise<SurveyFrontend> {
  const requestConfig = getCustomApiConfig(sourceApiConfigSurvey, {
    formatUrl: ({ url }) =>
      version === 'latest'
        ? `${url}/${surveyId}/latest`
        : `${url}/${surveyId}/versions/${version}`,
    method: 'GET',
    enableCache,
    transformResponse(survey: Survey) {
      const surveyCamelized = camelize(survey);
      const base = pick(surveyCamelized, [
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
        title: base.title ?? `Survey ${base.version}`,
        questions: survey.questions?.map((question) => {
          return (
            pick(camelize(question), [
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

  const hasAnswer = surveyEntryPayload.answers.some((answer) => {
    if (!answer.answer) {
      return false;
    }
    const answer_ = answer.answer.trim();
    // If the answer is a number, we don't want to count it as an answer for the purpose of firing the 'KTO Submission' alert.
    // We're not immediately interested in the rating of submissions, but rather answers with meaningful content that are submitted.
    return answer_ ? !isNumeric(answer_) : false;
  });

  const requestConfig = getCustomApiConfig(sourceApiConfigSurvey, {
    formatUrl: ({ url }) => `${url}/${surveyId}/versions/${version}/entries`,
    method: 'POST',
    data: surveyEntryPayload,
    enableCache: false,
  });

  const response = await requestData<SaveUserFeedbackResponse>(requestConfig);

  if (response.status === 'OK' && hasAnswer) {
    // There is an alert called 'KTO Submission' -
    // that requires this log line to be able to fire.
    captureMessage('A userfeedback survey has been submitted', {
      properties: { hasAnswer },
    });
  }

  return response;
}

async function fetchFeedbackSurveyEntries(
  surveyId: Survey['unique_code'],
  surveyVersion: string,
  page: number = 1
): ApiResponsePromise<FeedbackSurveyEntries> {
  const PAGE_SIZE = 100;
  const requestConfig = getCustomApiConfig(sourceApiConfigSurvey, {
    formatUrl: ({ url }) => `${url}/entries`,
    method: 'GET',
    params: {
      page_size: PAGE_SIZE,
      page,
      survey_unique_code: surveyId,
      survey_version: surveyVersion,
      sort_by: 'created_at',
      sort_order: 'desc',
    },
    enableCache: false,
    transformResponse(entriesResponse: SurveyEntriesResponse) {
      const entriesBySurvey = entriesResponse.results.filter((entry) => {
        return entry.survey_unique_code === surveyId;
      });
      const entries = entriesBySurvey.map((entry) => {
        const surveyEntryFrontend: SurveyEntryFrontend = {
          id: entry.id,
          answers: Object.fromEntries(
            entry.answers.map((answer) => [answer.question, answer.answer])
          ),
          dateCreated: entry.created_at,
          dateCreatedFormatted: defaultDateTimeFormat(entry.created_at),
          maErrors: (entry.metadata.maErrors ||
            []) as SurveyEntryFrontend['maErrors'],
          maThemas: (entry.metadata.maThemas || []) as string[],
          browserTitle: (entry.metadata.browserTitle ||
            'Onbekende paginatitel') as string,
          metadata: omit(entry.metadata, [
            'maThemas',
            'maErrors',
            'browserTitle',
          ]),
          entryPoint: entry.entry_point,
          administrationMeta: null,
        };

        return surveyEntryFrontend;
      });

      return {
        entries,
        total: entriesResponse.count,
        pageCount: Math.ceil(entriesResponse.count / PAGE_SIZE),
      };
    },
  });

  return requestData<FeedbackSurveyEntries>(requestConfig);
}

export async function userFeedbackOverview(
  surveyId: Survey['unique_code'],
  version: string,
  page: number = 1
): ApiResponsePromise<SurveyOverviewFrontend> {
  const USE_CACHE = false;
  const surveyRequest = fetchUserFeedbackSurvey(surveyId, version, USE_CACHE);
  const entriesRequest = fetchFeedbackSurveyEntries(surveyId, version, page);

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
  const entries = entriesResponse.content.entries;
  let entriesWithMeta = entries;

  if (IS_DB_ENABLED && entries.length > 0) {
    const metaByEntryId = await getUserFeedbackMetaByEntryIds(
      entries.map((entry) => entry.id)
    );

    entriesWithMeta = entries.map((entry) => ({
      ...entry,
      administrationMeta: metaByEntryId.get(entry.id) ?? null,
    }));
  }

  const questionsById = Object.fromEntries(
    survey.questions.map((question) => {
      return [question.id, question.questionText];
    })
  );

  return apiSuccessResult(
    {
      survey: {
        title: survey.title,
        questions: questionsById,
      },
      entries: entriesWithMeta.toSorted((a, b) =>
        b.dateCreated.localeCompare(a.dateCreated)
      ),
      total: entriesResponse.content.total,
      pageCount: entriesResponse.content.pageCount,
    },
    getFailedDependencies({
      survey: surveyResponse,
    })
  );
}
