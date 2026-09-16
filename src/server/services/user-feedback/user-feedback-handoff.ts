import { ALL_ISSUES_LINK } from './jira/user-feedback-jira.service-config.ts';
import { upsertAdministrationMeta } from './user-feedback-meta.model.ts';
import type {
  HandoffDepartmentInput,
  UserFeedbackHandoffConfigResponse,
  UserFeedbackAdministrationMeta,
} from './user-feedback.types.ts';
import {
  apiSuccessResult,
  type ApiResponsePromise,
} from '../../../universal/helpers/api.ts';
import { pick } from '../../../universal/helpers/utils.ts';
import { getValueMapFromEnv } from '../../helpers/env.ts';

const HANDOFF_DEPARTMENTS: UserFeedbackHandoffConfigResponse['departments'] =
  getValueMapFromEnv('BFF_HANDOFF_DEPARTMENTS')
    .entries()
    .map(([name, email]) => {
      return {
        name,
        email,
      };
    })
    .toArray();

const HANDOFF_CC_EMAIL = 'mijnamsterdam@amsterdam.nl';

const NEWLINE_SEPARATOR = encodeURIComponent('\n');

const HANDOFF_EMAIL_INTRO = `Hallo, wij kregen onderstaande melding op Mijn Amsterdam. Kunnen jullie dit verder oppakken?${NEWLINE_SEPARATOR + NEWLINE_SEPARATOR}`;

const HANDOFF_EMAIL_SIGN_OFF = `${NEWLINE_SEPARATOR}Mochten er nog vragen en/of opmerkingen zijn tav deze melding horen wij dat graag!${NEWLINE_SEPARATOR + NEWLINE_SEPARATOR}Met vriendelijke groet,${NEWLINE_SEPARATOR}Team Mijn Amsterdam`;

export function getUserFeedbackHandoffConfig(): ApiResponsePromise<UserFeedbackHandoffConfigResponse> {
  return Promise.resolve(
    apiSuccessResult({
      departments: HANDOFF_DEPARTMENTS,
      ccEmail: HANDOFF_CC_EMAIL,
      emailIntro: HANDOFF_EMAIL_INTRO,
      emailSignOff: HANDOFF_EMAIL_SIGN_OFF,
      issuesOverviewLink: ALL_ISSUES_LINK,
    })
  );
}

export async function handoffFeedbackEntryToDepartment(
  input: HandoffDepartmentInput
): ApiResponsePromise<UserFeedbackAdministrationMeta> {
  const administrationMeta = await upsertAdministrationMeta(
    input.entryId,
    pick(input, ['departmentName', 'departmentEmail'])
  );

  return apiSuccessResult(administrationMeta);
}
