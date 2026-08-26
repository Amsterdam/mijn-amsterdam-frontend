import { HttpStatusCode } from 'axios';

import {
  getJiraAuthHeader,
  isAuthenticationFailure,
  normalizeJiraLabel,
  toJiraDescription,
} from './user-feedback-jira.helpers.ts';
import {
  AUTH_FAILURE_MESSAGE,
  JIRA_BOARD_ID,
  JIRA_ISSUE_TYPE,
  JIRA_LABEL_KTO_ISSUES_RAW,
  JIRA_PARENT_TICKET_KEY,
  JIRA_PROJECT_KEY,
  sourceApiConfigJiraAgile,
  sourceApiConfigJiraRestV3,
} from './user-feedback-jira.service-config.ts';
import type {
  JiraBoardsResponse,
  JiraIssueCreateResponse,
  JiraMyselfResponse,
  JiraSprintsResponse,
} from './user-feedback-jira.types.ts';
import {
  apiErrorResult,
  apiSuccessResult,
  type ApiResponsePromise,
} from '../../../../universal/helpers/api.ts';
import { getCustomApiConfig } from '../../../helpers/source-api-helpers.ts';
import { requestData } from '../../../helpers/source-api-request.ts';
import { getAccountData } from '../../admin/admin-account.model.ts';
import {
  getUserFeedbackMetaByEntryId,
  upsertAdministrationMeta,
} from '../user-feedback-meta.model.ts';
import type {
  CreateJiraTicketInput,
  UserFeedbackAdministrationMeta,
} from '../user-feedback.types.ts';

async function fetchJiraAccountId(username: string, jiraApiToken: string) {
  const authHeader = getJiraAuthHeader(username, jiraApiToken);
  const requestConfig = getCustomApiConfig(sourceApiConfigJiraRestV3, {
    formatUrl: (config) => `${config.url}/myself`,
    method: 'GET',
    headers: {
      Authorization: authHeader,
    },
  });

  const myselfResponse = await requestData<JiraMyselfResponse>(requestConfig);

  return myselfResponse;
}

async function getBoardId(authHeader: string) {
  if (JIRA_BOARD_ID) {
    return Number.parseInt(JIRA_BOARD_ID, 10);
  }

  const requestConfig = getCustomApiConfig(sourceApiConfigJiraAgile, {
    formatUrl: (config) => `${config.url}/board`,
    method: 'GET',
    headers: {
      Authorization: authHeader,
    },
    params: {
      projectKeyOrId: JIRA_PROJECT_KEY,
      type: 'scrum',
      maxResults: 1,
    },
  });

  const boardsResponse = await requestData<JiraBoardsResponse>(requestConfig);

  if (boardsResponse.status === 'ERROR') {
    return boardsResponse;
  }

  const boardId = boardsResponse.content?.values?.[0]?.id;

  if (!boardId) {
    return apiErrorResult('No Jira Scrum board found for project.', null, 500);
  }

  return boardId;
}

async function getActiveSprintId(authHeader: string) {
  const boardId = await getBoardId(authHeader);

  if (typeof boardId !== 'number') {
    return boardId;
  }

  const requestConfig = getCustomApiConfig(sourceApiConfigJiraAgile, {
    formatUrl: (config) => `${config.url}/board/${boardId}/sprint`,
    method: 'GET',
    headers: {
      Authorization: authHeader,
    },
    params: {
      state: 'active',
      maxResults: 1,
    },
  });

  const sprintResponse = await requestData<JiraSprintsResponse>(requestConfig);

  if (sprintResponse.status === 'ERROR') {
    return sprintResponse;
  }

  const activeSprintId = sprintResponse.content?.values?.[0]?.id;

  if (!activeSprintId) {
    return apiErrorResult('No active Jira sprint found.', null, 500);
  }

  return activeSprintId;
}

async function addIssueToActiveSprint(authHeader: string, issueKey: string) {
  const activeSprintId = await getActiveSprintId(authHeader);

  if (typeof activeSprintId !== 'number') {
    return activeSprintId;
  }

  const requestConfig = getCustomApiConfig(sourceApiConfigJiraAgile, {
    formatUrl: (config) => `${config.url}/sprint/${activeSprintId}/issue`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    data: {
      issues: [issueKey],
    },
  });

  return requestData<{ issues: string[] }>(requestConfig);
}

export async function createJiraTicketForFeedbackEntry(
  input: CreateJiraTicketInput,
  username: string
): ApiResponsePromise<UserFeedbackAdministrationMeta> {
  const existingMeta = await getUserFeedbackMetaByEntryId(input.entryId);

  if (existingMeta?.jiraTicketNumber) {
    return apiSuccessResult(existingMeta);
  }

  const accountData = await getAccountData(username);

  if (!accountData?.jiraApiToken) {
    return apiErrorResult(
      AUTH_FAILURE_MESSAGE,
      null,
      HttpStatusCode.Unauthorized
    );
  }

  const authHeader = getJiraAuthHeader(username, accountData.jiraApiToken);
  const jiraAccountResponse = await fetchJiraAccountId(
    username,
    accountData.jiraApiToken
  );

  if (jiraAccountResponse.status === 'ERROR') {
    if (isAuthenticationFailure(jiraAccountResponse.code)) {
      return apiErrorResult(
        AUTH_FAILURE_MESSAGE,
        null,
        HttpStatusCode.Unauthorized
      );
    }

    return jiraAccountResponse;
  }

  if (!jiraAccountResponse.content) {
    return apiErrorResult(
      'Jira account lookup returned no content.',
      null,
      500
    );
  }

  const jiraAccountId = jiraAccountResponse.content.accountId;

  const summary = `${input.surveyTitle} - entry ${input.entryId}`;

  const requestConfig = getCustomApiConfig(sourceApiConfigJiraRestV3, {
    formatUrl: (config) => `${config.url}/issue`,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader,
    },
    data: {
      fields: {
        project: {
          key: JIRA_PROJECT_KEY,
        },
        issuetype: {
          name: JIRA_ISSUE_TYPE,
        },
        assignee: {
          accountId: jiraAccountId,
        },
        parent: {
          key: JIRA_PARENT_TICKET_KEY,
        },
        labels: [normalizeJiraLabel(JIRA_LABEL_KTO_ISSUES_RAW)],
        summary,
        description: toJiraDescription(input),
      },
    },
  });

  const createIssueResponse =
    await requestData<JiraIssueCreateResponse>(requestConfig);

  if (createIssueResponse.status === 'ERROR') {
    if (isAuthenticationFailure(createIssueResponse.code)) {
      return apiErrorResult(
        AUTH_FAILURE_MESSAGE,
        null,
        HttpStatusCode.Unauthorized
      );
    }

    return createIssueResponse;
  }

  if (!createIssueResponse.content) {
    return apiErrorResult(
      'Jira issue creation returned no content.',
      null,
      500
    );
  }

  const jiraTicketNumber = createIssueResponse.content.key;
  const addToSprintResponse = await addIssueToActiveSprint(
    authHeader,
    jiraTicketNumber
  );

  if (addToSprintResponse.status === 'ERROR') {
    if (isAuthenticationFailure(addToSprintResponse.code)) {
      return apiErrorResult(
        AUTH_FAILURE_MESSAGE,
        null,
        HttpStatusCode.Unauthorized
      );
    }

    return addToSprintResponse;
  }

  return upsertApiResponse(input.entryId, {
    jiraTicketNumber,
  });
}

export async function upsertApiResponse(
  entryId: number,
  metadata: Partial<
    Omit<UserFeedbackAdministrationMeta, 'dateCreated' | 'id' | 'entryId'>
  >
) {
  try {
    const administrationMeta = await upsertAdministrationMeta(
      entryId,
      metadata
    );
    return apiSuccessResult(administrationMeta);
  } catch (error: unknown) {
    return apiErrorResult(
      `Failed to upsert Jira ticket meta.: ${(error as Error).message}`,
      null,
      500
    );
  }
}
