import {
  fetchUserFeedbackSurvey,
  saveUserFeedback,
  userFeedbackOverview,
} from './user-feedback';
import {
  SURVEY_ID_INLINE_KTO,
  SURVEY_VERSION_INLINE_KTO,
} from './user-feedback.service-config';
import {
  userFeedbackInput,
  type Survey,
  type UserFeedbackInput,
} from './user-feedback.types';
import { range } from '../../../universal/helpers/utils';
import {
  sendBadRequestInvalidInput,
  sendResponse,
  type RequestWithQueryParams,
  type ResponseAuthenticated,
} from '../../routing/route-helpers';

export async function handleFetchSurvey(
  req: RequestWithQueryParams<{ id?: Survey['unique_code']; version?: string }>,
  res: ResponseAuthenticated
) {
  const survey = await fetchUserFeedbackSurvey(req.query.id, req.query.version);

  return sendResponse(res, survey);
}

export async function handleFetchSurveyOverview(
  req: RequestWithQueryParams<{
    id?: Survey['unique_code'];
    version?: string;
    page?: string;
  }>,
  res: ResponseAuthenticated
) {
  const surveyOverview = await userFeedbackOverview(
    req.query.id ?? SURVEY_ID_INLINE_KTO,
    req.query.version ?? SURVEY_VERSION_INLINE_KTO,
    parseInt(req.query.page || '1', 10)
  );

  return sendResponse(res, surveyOverview);
}

export async function handleUserFeedbackSubmission(
  req: RequestWithQueryParams<{ id?: Survey['unique_code']; version: string }>,
  res: ResponseAuthenticated
) {
  let userFeedback: UserFeedbackInput;

  try {
    userFeedback = userFeedbackInput.parse(req.body);
  } catch (error) {
    return sendBadRequestInvalidInput(res, error);
  }

  const response = await saveUserFeedback(
    req.query.id ?? SURVEY_ID_INLINE_KTO,
    req.query.version,
    userFeedback
  );

  return sendResponse(res, response);
}

export async function handleShowSurveyOverview(
  req: RequestWithQueryParams<{
    id?: Survey['unique_code'];
    version?: string;
    page?: string;
  }>,
  res: ResponseAuthenticated
) {
  const currentPage = parseInt(req.query.page || '1', 10);
  const feedbackOverview = await userFeedbackOverview(
    req.query.id ?? SURVEY_ID_INLINE_KTO,
    req.query.version ?? SURVEY_VERSION_INLINE_KTO,
    currentPage
  );

  const entries = feedbackOverview.content?.entries || [];

  const score = (
    entries.reduce((acc, entry) => {
      if (typeof entry === 'undefined') {
        return acc;
      }
      const rating = Object.values(entry.answers)[0] || '0';
      if (isNaN(parseInt(rating, 10))) {
        return acc;
      }
      return acc + parseInt(rating, 10);
    }, 0) / (entries.length || 1)
  ).toFixed(2);

  const pageLinks = range(1, feedbackOverview.content?.pageCount || 1).map(
    (page) => ({
      page,
      url: `?page=${page}`,
    })
  );

  return res.render('user-feedback-overview', {
    feedbackOverview: {
      ...feedbackOverview.content,
      score,
      pageLinks,
      currentPage,
    },
  });
}
