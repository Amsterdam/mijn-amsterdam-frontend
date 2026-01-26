import {
  fetchUserFeedbackSurvey,
  saveUserFeedback,
  userFeedbackOverview,
} from './user-feedback';
import { SURVEY_ID_INLINE_KTO } from './user-feedback.service-config';
import {
  userFeedbackInput,
  type Survey,
  type UserFeedbackInput,
} from './user-feedback.types';
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
  req: RequestWithQueryParams<{ id?: Survey['unique_code']; version?: string }>,
  res: ResponseAuthenticated
) {
  const surveyOverview = await userFeedbackOverview(
    req.query.id ?? SURVEY_ID_INLINE_KTO,
    req.query.version ?? 'latest'
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
