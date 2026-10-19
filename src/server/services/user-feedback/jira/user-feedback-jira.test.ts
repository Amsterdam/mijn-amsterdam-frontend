import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getAccountData: vi.fn(),
  getUserFeedbackMetaByEntryId: vi.fn(),
  upsertAdministrationMeta: vi.fn(),
  requestData: vi.fn(),
}));

vi.mock('../../admin/admin-account.model.ts', () => ({
  getAccountData: mocks.getAccountData,
}));
vi.mock('../user-feedback-meta.model.ts', () => ({
  getUserFeedbackMetaByEntryId: mocks.getUserFeedbackMetaByEntryId,
  upsertAdministrationMeta: mocks.upsertAdministrationMeta,
}));
vi.mock('../../../helpers/source-api-request.ts', () => ({
  requestData: mocks.requestData,
}));

import { AUTH_FAILURE_MESSAGE } from './user-feedback-jira.service-config.ts';
import { createJiraTicketForFeedbackEntry } from './user-feedback-jira.ts';
import {
  apiErrorResult,
  apiSuccessResult,
} from '../../../../universal/helpers/api.ts';
import type {
  CreateJiraTicketInput,
  UserFeedbackAdministrationMeta,
} from '../user-feedback.types.ts';

const input: CreateJiraTicketInput = {
  entryId: 123,
  surveyTitle: 'Feedback survey',
  entryPoint: '/home',
  dateCreated: '2026-10-12T09:15:00.000Z',
  questionAnswers: [
    { question: 'Wat vindt u van deze pagina?', answer: '5' },
    {
      question: 'Heeft u nog een tip of compliment voor ons?',
      answer: 'Fijne website!',
    },
    { question: 'Uw e-mailadres (niet verplicht)', answer: 'test@example.com' },
  ],
};

const username = 'admin@example.com';
const account = { username, jiraApiToken: 'jira-token', lastSignInDate: '' };

const existingMeta: UserFeedbackAdministrationMeta = {
  id: 1,
  entryId: input.entryId,
  jiraTicketNumber: 'MIJN-100',
  departmentName: null,
  departmentEmail: null,
  dateCreated: '2026-10-12T09:15:00.000Z',
  dateModified: '2026-10-12T09:15:00.000Z',
  jiraTicketUrl: 'https://gemeente-amsterdam.atlassian.net/browse/MIJN-100',
};

function jiraResponse<T>(content: T) {
  return { status: 'OK', content };
}

function requestSequence(responses: ReturnType<typeof jiraResponse>[]) {
  for (const response of responses) {
    mocks.requestData.mockResolvedValueOnce(response);
  }
}

describe('createJiraTicketForFeedbackEntry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getUserFeedbackMetaByEntryId.mockResolvedValue(null);
    mocks.getAccountData.mockResolvedValue(account);
    mocks.upsertAdministrationMeta.mockResolvedValue(existingMeta);
  });

  it('returns unauthorized without contacting Jira when the account has no token', async () => {
    mocks.getAccountData.mockResolvedValue({ ...account, jiraApiToken: '' });

    await expect(
      createJiraTicketForFeedbackEntry(input, username)
    ).resolves.toEqual(apiErrorResult(AUTH_FAILURE_MESSAGE, null, 401));

    expect(mocks.requestData).not.toHaveBeenCalled();
    expect(mocks.upsertAdministrationMeta).not.toHaveBeenCalled();
  });

  it('returns an error when Jira account lookup fails', async () => {
    const error = apiErrorResult('Jira lookup failed', null, 503);
    mocks.requestData.mockResolvedValueOnce(error);

    await expect(
      createJiraTicketForFeedbackEntry(input, username)
    ).resolves.toEqual(error);

    expect(mocks.requestData).toHaveBeenCalledTimes(1);
    expect(mocks.upsertAdministrationMeta).not.toHaveBeenCalled();
  });

  it('returns an error when Jira issue creation fails', async () => {
    const error = apiErrorResult('Jira create failed', null, 503);
    requestSequence([jiraResponse({ accountId: 'jira-account-1' }), error]);

    await expect(
      createJiraTicketForFeedbackEntry(input, username)
    ).resolves.toEqual(error);

    expect(mocks.requestData).toHaveBeenCalledTimes(2);
    expect(mocks.upsertAdministrationMeta).not.toHaveBeenCalled();
  });

  it('reuses an existing ticket and adds it to the active sprint without creating another issue', async () => {
    mocks.getUserFeedbackMetaByEntryId.mockResolvedValue(existingMeta);
    requestSequence([
      jiraResponse({ values: [{ id: 42 }] }),
      jiraResponse({ values: [{ id: 7, state: 'active' }] }),
      jiraResponse({ issues: [] }),
    ]);

    await expect(
      createJiraTicketForFeedbackEntry(input, username)
    ).resolves.toEqual(apiSuccessResult(existingMeta));

    expect(mocks.requestData).toHaveBeenCalledTimes(3);
    expect(mocks.requestData).not.toHaveBeenCalledWith(
      expect.objectContaining({ url: expect.stringMatching(/\/myself$/) })
    );
    expect(mocks.requestData).not.toHaveBeenCalledWith(
      expect.objectContaining({
        url: expect.stringMatching(/\/rest\/api\/3\/issue$/),
      })
    );
    expect(mocks.upsertAdministrationMeta).not.toHaveBeenCalled();
  });

  it('persists the newly created ticket number before assigning the issue to a sprint', async () => {
    const savedMeta = { ...existingMeta, jiraTicketNumber: 'MIJN-101' };
    mocks.upsertAdministrationMeta.mockResolvedValue(savedMeta);
    requestSequence([
      jiraResponse({ accountId: 'jira-account-1' }),
      jiraResponse({ key: 'MIJN-101' }),
      jiraResponse({ values: [{ id: 42 }] }),
      jiraResponse({ values: [{ id: 7, state: 'active' }] }),
      jiraResponse({ issues: [] }),
    ]);

    await expect(
      createJiraTicketForFeedbackEntry(input, username)
    ).resolves.toEqual(apiSuccessResult(savedMeta));

    expect(mocks.upsertAdministrationMeta).toHaveBeenCalledWith(input.entryId, {
      jiraTicketNumber: 'MIJN-101',
    });
    expect(mocks.requestData).toHaveBeenCalledTimes(5);
    expect(mocks.requestData).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({
        method: 'POST',
        url: expect.stringMatching(/\/sprint\/7\/issue$/),
        data: { issues: ['MIJN-101'] },
      })
    );
  });

  it('returns a metadata persistence error and does not assign an unrecorded ticket to a sprint', async () => {
    const error = new Error('database unavailable');
    mocks.upsertAdministrationMeta.mockRejectedValue(error);
    requestSequence([
      jiraResponse({ accountId: 'jira-account-1' }),
      jiraResponse({ key: 'MIJN-101' }),
    ]);

    const result = await createJiraTicketForFeedbackEntry(input, username);

    expect(result).toEqual(
      apiErrorResult(
        'Failed to upsert Jira ticket meta.: database unavailable',
        null,
        500
      )
    );
    expect(mocks.upsertAdministrationMeta).toHaveBeenCalledWith(input.entryId, {
      jiraTicketNumber: 'MIJN-101',
    });
    expect(mocks.requestData).toHaveBeenCalledTimes(2);
  });

  it('returns a sprint-assignment error but keeps the successfully persisted ticket metadata', async () => {
    const savedMeta = { ...existingMeta, jiraTicketNumber: 'MIJN-101' };
    const error = apiErrorResult('Sprint assignment failed', null, 503);
    mocks.upsertAdministrationMeta.mockResolvedValue(savedMeta);
    requestSequence([
      jiraResponse({ accountId: 'jira-account-1' }),
      jiraResponse({ key: 'MIJN-101' }),
      jiraResponse({ values: [{ id: 42 }] }),
      jiraResponse({ values: [{ id: 7, state: 'active' }] }),
      error,
    ]);

    await expect(
      createJiraTicketForFeedbackEntry(input, username)
    ).resolves.toEqual(error);

    expect(mocks.upsertAdministrationMeta).toHaveBeenCalledWith(input.entryId, {
      jiraTicketNumber: 'MIJN-101',
    });
    expect(mocks.requestData).toHaveBeenCalledTimes(5);
  });
});
