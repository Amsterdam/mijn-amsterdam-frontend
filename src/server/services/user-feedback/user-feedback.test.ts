import { describe, expect } from 'vitest';

import { fetchUserFeedbackSurvey, saveUserFeedback } from './user-feedback';
import type { UserFeedbackInput } from './user-feedback.types';
import { remoteApi } from '../../../testing/utils';

describe('User Feedback Functions', () => {
  describe('fetchUserFeedbackSurvey', () => {
    it('should fetch survey data for a given id and version', async () => {
      const mockSurvey = {
        id: 'survey123',
        version: '1',
        questions: [{ what_ever: 'foo' }],
        hello_world: 'x',
      };

      remoteApi
        .get('/survey/api/v1/surveys/survey123/versions/1')
        .times(1)
        .reply(200, mockSurvey);

      const result = await fetchUserFeedbackSurvey('survey123', '1');

      expect(result).toStrictEqual({
        content: {
          helloWorld: 'x',
          id: 'survey123',
          questions: [
            {
              whatEver: 'foo',
            },
          ],
          version: '1',
        },
        status: 'OK',
      });
    });
  });

  describe('saveUserFeedback', () => {
    it('should save user feedback and return a success response', async () => {
      const feedback = {
        answers: JSON.stringify([{ question: 1, answer: 'yes' }]),
      } as unknown as UserFeedbackInput;

      const mockResponse = JSON.stringify({ success: true });

      remoteApi
        .post('/survey/api/v1/surveys/survey123/versions/1/entries')
        .reply(200, mockResponse);

      const result = await saveUserFeedback('survey123', '1', feedback);

      expect(result).toEqual({ content: { success: true }, status: 'OK' });
    });
  });
});
