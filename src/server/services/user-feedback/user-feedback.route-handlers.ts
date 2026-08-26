import type { Request, Response } from 'express';

import {
  createJiraTicketForFeedbackEntry,
  upsertApiResponse,
} from './jira/user-feedback-jira.ts';
import { getUserFeedbackHandoffConfig } from './user-feedback-handoff.ts';
import {
  SURVEY_ID_INLINE_KTO,
  SURVEY_VERSION_INLINE_KTO,
} from './user-feedback.service-config.ts';
import {
  fetchUserFeedbackSurvey,
  saveUserFeedback,
  userFeedbackOverview,
} from './user-feedback.ts';
import {
  createJiraTicketInput,
  handoffDepartmentInput,
  type Survey,
  type CreateJiraTicketInput,
  type HandoffDepartmentInput,
  type UserFeedbackInput,
  userFeedbackInput,
} from './user-feedback.types.ts';
import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import { pick, range } from '../../../universal/helpers/utils.ts';
import {
  sendBadRequestInvalidInput,
  sendResponse,
  type RequestWithRouteAndQueryParams,
  type RequestWithQueryParams,
} from '../../routing/route-helpers.ts';
import type { RequestWithSession } from '../admin/admin-types.ts';

export async function handleFetchSurvey(
  req: RequestWithQueryParams<{ id?: Survey['unique_code']; version?: string }>,
  res: Response
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
  res: Response
) {
  const surveyOverview = await userFeedbackOverview(
    req.query.id ?? SURVEY_ID_INLINE_KTO,
    req.query.version ?? SURVEY_VERSION_INLINE_KTO,
    parseInt(req.query.page || '1', 10)
  );

  return sendResponse(res, surveyOverview);
}

export async function handleUserFeedbackHandoffConfig(
  _req: Request,
  res: Response
) {
  const handoffConfig = await getUserFeedbackHandoffConfig();

  return sendResponse(res, handoffConfig);
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

export async function handleShowSurveyOverview(
  req: RequestWithQueryParams<{
    id?: Survey['unique_code'];
    version?: string;
    page?: string;
  }>,
  res: Response
) {
  const currentPage = parseInt(req.query.page || '1', 10);
  const feedbackOverview = await userFeedbackOverview(
    req.query.id ?? SURVEY_ID_INLINE_KTO,
    req.query.version ?? SURVEY_VERSION_INLINE_KTO,
    currentPage
  );

  if (feedbackOverview.status === 'ERROR') {
    return sendResponse(res, feedbackOverview);
  }

  const entries = feedbackOverview.content?.entries || [];

  const score = (
    entries.reduce((acc, entry) => {
      if (!entry) {
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

  return sendResponse(
    res,
    apiSuccessResult({
      ...feedbackOverview.content,
      score,
      pageLinks,
      currentPage,
    })
  );
}

function getUsernameFromSession(req: Request): string {
  return (req as RequestWithSession).session.username;
}

export async function handleCreateJiraTicket(
  req: RequestWithRouteAndQueryParams<{ entryId: string }>,
  res: Response
) {
  let ticketInput: CreateJiraTicketInput;

  try {
    ticketInput = createJiraTicketInput.parse({
      ...req.body,
      entryId: Number.parseInt(req.params.entryId, 10),
    });
  } catch (error) {
    return sendBadRequestInvalidInput(res, error);
  }

  const username = getUsernameFromSession(req);

  const response = await createJiraTicketForFeedbackEntry(
    ticketInput,
    username
  );

  return sendResponse(res, response);
}

export async function handleDeleteJiraTicketMeta(
  req: RequestWithRouteAndQueryParams<{ entryId: string }>,
  res: Response
) {
  const entryId = Number.parseInt(req.params.entryId, 10);

  if (Number.isNaN(entryId) || entryId <= 0) {
    return sendBadRequestInvalidInput(res, 'Invalid entry id');
  }

  return sendResponse(
    res,
    await upsertApiResponse(entryId, {
      jiraTicketNumber: null,
    })
  );
}

export async function handleHandoffFeedbackToDepartment(
  req: RequestWithRouteAndQueryParams<{ entryId: string }>,
  res: Response<{ username: string }>
) {
  let handoffInput: HandoffDepartmentInput;

  try {
    handoffInput = handoffDepartmentInput.parse({
      ...req.body,
      entryId: Number.parseInt(req.params.entryId, 10),
    });
  } catch (error) {
    return sendBadRequestInvalidInput(res, error);
  }

  return sendResponse(
    res,
    await upsertApiResponse(
      handoffInput.entryId,
      pick(handoffInput, ['departmentName', 'departmentEmail'])
    )
  );
}
