import { getJiraTicketUrl } from './jira/user-feedback-jira.helpers.ts';
import type {
  UserFeedbackAdministrationMeta,
  UserFeedbackMetaRow,
} from './user-feedback.types.ts';
import { pick } from '../../../universal/helpers/utils.ts';

export function toMetaData(
  row: UserFeedbackMetaRow
): UserFeedbackAdministrationMeta {
  const rowValues = pick(row, [
    'id',
    'entryId',
    'jiraTicketNumber',
    'departmentName',
    'departmentEmail',
  ]);
  return {
    ...rowValues,
    dateCreated: row.dateCreated.toISOString(),
    dateModified: row.dateModified.toISOString(),
    jiraTicketUrl: rowValues.jiraTicketNumber
      ? getJiraTicketUrl(rowValues.jiraTicketNumber)
      : null,
  };
}
