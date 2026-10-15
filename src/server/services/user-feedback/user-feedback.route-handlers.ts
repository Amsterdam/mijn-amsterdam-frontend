import type { Response } from 'express';

import { SURVEY_ID_INLINE_KTO } from './user-feedback.service-config.ts';
import { fetchUserFeedbackSurvey, saveUserFeedback } from './user-feedback.ts';
import {
  type Survey,
  type UserFeedbackInput,
  userFeedbackInput,
} from './user-feedback.types.ts';
import {
  sendBadRequestInvalidInput,
  sendResponse,
  type RequestWithQueryParams,
} from '../../routing/route-helpers.ts';

export async function handleFetchSurvey(
  req: RequestWithQueryParams<{ id?: Survey['unique_code']; version?: string }>,
  res: Response
) {
  const survey = await fetchUserFeedbackSurvey(req.query.id, req.query.version);

  return sendResponse(res, survey);
}

export async function handleUserFeedbackSubmission(
  req: RequestWithQueryParams<{ id?: Survey['unique_code']; version: string }>,
  res: Response
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
