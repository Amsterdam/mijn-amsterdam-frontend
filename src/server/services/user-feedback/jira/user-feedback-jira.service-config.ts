import { isEnabled } from '../../../config/azure-appconfiguration.ts';
import type { DataRequestConfig } from '../../../config/source-api.ts';
import { getFromEnv } from '../../../helpers/env.ts';

function requiredEnv(key: string) {
  return getFromEnv(
    key,
    true,
    isEnabled('USER_FEEDBACK.ticketCreation')
  ) as string;
}

export const JIRA_BASE_URL = requiredEnv('BFF_JIRA_BASE_URL');
export const JIRA_PROJECT_KEY = requiredEnv('BFF_JIRA_PROJECT_KEY');
export const JIRA_ISSUE_TYPE = requiredEnv('BFF_JIRA_ISSUE_TYPE');
export const JIRA_PARENT_TICKET_KEY = requiredEnv('BFF_JIRA_PARENT_TICKET_KEY');

export const JIRA_LABEL_KTO_ISSUES_RAW = requiredEnv(
  'BFF_JIRA_LABEL_KTO_ISSUES'
);

export const JIRA_BOARD_ID = getFromEnv('BFF_JIRA_BOARD_ID', false);
export const MA_FRONTEND_URL = requiredEnv('MA_FRONTEND_URL');

export const AUTH_FAILURE_MESSAGE =
  'Renew your token / check your authentication.';

export const sourceApiConfigJiraRestV3: DataRequestConfig = {
  url: `${JIRA_BASE_URL}/rest/api/3`,
  method: 'GET',
  headers: {
    Accept: 'application/json',
  },
  enableCache: false,
} as const;

export const sourceApiConfigJiraAgile: DataRequestConfig = {
  url: `${JIRA_BASE_URL}/rest/agile/1.0`,
  method: 'GET',
  headers: {
    Accept: 'application/json',
  },
  enableCache: false,
} as const;

export const ALL_ISSUES_LINK =
  'https://gemeente-amsterdam.atlassian.net/issues/?jql=labels%20%3D%20%22KTO-issues%22';
