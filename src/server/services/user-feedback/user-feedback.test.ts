import { describe, expect } from 'vitest';

import { fetchUserFeedbackSurvey, saveUserFeedback } from './user-feedback.ts';
import type { UserFeedbackInput } from './user-feedback.types.ts';
import { remoteApi } from '../../../testing/utils.ts';
import { captureMessage } from '../monitoring.ts';

vi.mock('../../services/monitoring.ts', async (importOriginal) => {
  return {
    ...(await importOriginal()),
    captureMessage: vi.fn(),
  };
});

beforeEach(() => {
  vi.resetAllMocks();
});

describe('User Feedback Functions', () => {
  describe('fetchUserFeedbackSurvey', () => {
    it('should fetch survey data for a given id and version', async () => {
      const mockSurvey = {
        id: 'survey123',
        version: '1',
        questions: [{ question_text: 'foo' }],
        unique_code: 'x',
      };

      remoteApi
        .get('/survey/api/v1/surveys/survey123/versions/1')
        .times(1)
        .reply(200, mockSurvey);

      const result = await fetchUserFeedbackSurvey('survey123', '1');

      expect(result).toStrictEqual({
        content: {
          id: 'survey123',
          uniqueCode: 'x',
          questions: [
            {
              questionText: 'foo',
            },
          ],
          version: '1',
        },
        status: 'OK',
      });
    });
  });

  describe('saveUserFeedback', () => {
    const successResponse = { success: true };

    it('should save user feedback and return a success response', async () => {
      const feedback = {
        answers: JSON.stringify([{ question: 1, answer: 'yes' }]),
      } as unknown as UserFeedbackInput;

      remoteApi
        .post('/survey/api/v1/surveys/survey123/versions/1/entries')
        .reply(200, successResponse);

      const result = await saveUserFeedback('survey123', '1', feedback);

      expect(result).toEqual({ content: { success: true }, status: 'OK' });
    });

    it('log line to azure when a description is passed for alert', async () => {
      const feedback = {
        answers: JSON.stringify([
          { question: 1, answer: 'Ik wil dat FB een alert krijgt!' },
        ]),
      } as unknown as UserFeedbackInput;

      remoteApi
        .post('/survey/api/v1/surveys/survey123/versions/1/entries')
        .reply(200, successResponse);

      await saveUserFeedback('survey123', '1', feedback);
      expect(captureMessage).toHaveBeenCalledWith(
        'A userfeedback survey has been submitted',
        {
          properties: { hasAnswer: true },
        }
      );
    });
  });
});
