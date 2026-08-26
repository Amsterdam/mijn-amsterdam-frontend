import { HttpStatusCode } from 'axios';

import {
  JIRA_BASE_URL,
  MA_FRONTEND_URL,
} from './user-feedback-jira.service-config.ts';
import { defaultDateTimeFormat } from '../../../../universal/helpers/date.ts';
import type { CreateJiraTicketInput } from '../user-feedback.types.ts';

type DescriptionLine =
  | string
  | {
      type: 'link';
      text: string;
      href: string;
    };

function toAdfParagraph(line: DescriptionLine) {
  if (typeof line === 'string') {
    return {
      type: 'paragraph',
      content: line
        ? [
            {
              type: 'text',
              text: line,
            },
          ]
        : [],
    };
  }

  return {
    type: 'paragraph',
    content: [
      {
        type: 'text',
        text: line.text,
        marks: [
          {
            type: 'link',
            attrs: {
              href: line.href,
            },
          },
        ],
      },
    ],
  };
}

export function getJiraTicketUrl(ticketNumber: string) {
  return `${JIRA_BASE_URL}/browse/${ticketNumber}`;
}

export function normalizeJiraLabel(label: string) {
  return label.trim().replace(/\s+/g, '-');
}

export function getSurveyEntryUrl(entryId: number) {
  return `${MA_FRONTEND_URL}/admin/user-feedback#entry-${entryId}`;
}

export function getJiraAuthHeader(username: string, jiraApiToken: string) {
  const credentials = Buffer.from(`${username}:${jiraApiToken}`).toString(
    'base64'
  );

  return `Basic ${credentials}`;
}

export function isAuthenticationFailure(code?: number) {
  return (
    code === HttpStatusCode.Unauthorized || code === HttpStatusCode.Forbidden
  );
}

export function toJiraDescription(input: CreateJiraTicketInput) {
  const entryUrl = getSurveyEntryUrl(input.entryId);

  const lines: DescriptionLine[] = [
    `Entry ID: ${input.entryId}`,
    {
      type: 'link',
      text: 'Survey entry link',
      href: entryUrl,
    },
    `Datum en tijd: ${defaultDateTimeFormat(input.dateCreated)}`,
    `Pagina: ${input.entryPoint}`,
    '',
    'Vragen en antwoorden:',
    ...input.questionAnswers.map(
      ({ question, answer }) => `- ${question}: ${answer || '-'}`
    ),
  ];

  // Jira Cloud expects ADF for rich-text description fields.
  return {
    type: 'doc',
    version: 1,
    content: lines.map((line) => toAdfParagraph(line)),
  };
}
