import { fetchUserFeedbackSurvey, saveUserFeedback } from './user-feedback';
import {
  SURVEY_ID_INLINE_KTO,
  SURVEY_VERSION_INLINE_KTO,
} from './user-feedback.service-config';
import {
  userFeedbackInput,
  type UserFeedbackInput,
} from './user-feedback.types';
import {
  sendBadRequestInvalidInput,
  sendResponse,
  type RequestWithQueryParams,
  type ResponseAuthenticated,
} from '../../routing/route-helpers';

export async function handleFetchSurvey(
  req: RequestWithQueryParams<{ id?: string }>,
  res: ResponseAuthenticated
) {
  const survey = await fetchUserFeedbackSurvey(
    req.query.id ?? SURVEY_ID_INLINE_KTO
  );

  return sendResponse(res, survey);
}

export async function handleUserFeedbackSubmission(
  req: RequestWithQueryParams<{ id?: string; version?: string }>,
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
    req.query.version ?? SURVEY_VERSION_INLINE_KTO,
    userFeedback
  );

  return sendResponse(res, response);
}
