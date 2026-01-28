import type { Request } from 'express';
import { describe, expect, vi, beforeEach, MockInstance } from 'vitest';

import * as userFeedback from './user-feedback';
import * as routeHandlers from './user-feedback.route-handlers';
import { ResponseAuthenticatedMock, RequestMock } from '../../../testing/utils';
import type { ResponseAuthenticated } from '../../routing/route-helpers';

const {
  handleFetchSurvey,
  handleFetchSurveyOverview,
  handleUserFeedbackSubmission,
  handleShowSurveyOverview,
} = routeHandlers;

describe('User Feedback Route Handlers', () => {
  let req: Request;
  let res: ResponseAuthenticated;
  let fetchUserFeedbackSurvey: MockInstance;
  let userFeedbackOverview: MockInstance;
  let saveUserFeedback: MockInstance;

  beforeEach(() => {
    req = RequestMock.new().get();
    res = ResponseAuthenticatedMock.new();

    fetchUserFeedbackSurvey = vi.spyOn(userFeedback, 'fetchUserFeedbackSurvey');
    userFeedbackOverview = vi.spyOn(userFeedback, 'userFeedbackOverview');
    saveUserFeedback = vi.spyOn(userFeedback, 'saveUserFeedback');
  });

  test('handleFetchSurvey should return survey data', async () => {
    req.query = { id: 'survey123', version: '1.0' };
    const mockSurvey = { id: 'survey123', version: '1.0', questions: [] };
    fetchUserFeedbackSurvey.mockResolvedValue(mockSurvey);

    await handleFetchSurvey(req, res);

    expect(fetchUserFeedbackSurvey).toHaveBeenCalledWith('survey123', '1.0');
    expect(res.send).toHaveBeenCalledWith(mockSurvey);
  });

  test('handleFetchSurveyOverview should return survey overview', async () => {
    req.query = { id: 'survey123', version: 'latest' };
    const mockOverview = { id: 'survey123', content: { entries: [] } };
    userFeedbackOverview.mockResolvedValue(mockOverview);

    await handleFetchSurveyOverview(req, res);

    expect(userFeedbackOverview).toHaveBeenCalledWith('survey123', 'latest');
    expect(res.send).toHaveBeenCalledWith(mockOverview);
  });

  test('handleUserFeedbackSubmission should save feedback and return response', async () => {
    req.query = { id: 'survey123', version: '1.0' };
    req.body = {
      answers: 'x',
      browserPath: 'x',
      browserTitle: 'x',
      browserUserAgent: 'x',
      browserLanguage: 'x',
      browserScreenResolution: 'x',
      browserWindowInnerSize: 'x',
      browserTimezone: 'x',
      maThemas: 'x',
      maErrors: 'x',
      maProfileType: 'x',
      pageTitle: 'x',
      pageDetails: 'x',
    };
    const mockResponse = { success: true };
    saveUserFeedback.mockResolvedValue(mockResponse);

    await handleUserFeedbackSubmission(req, res);

    expect(saveUserFeedback).toHaveBeenCalledWith('survey123', '1.0', req.body);
    expect(res.send).toHaveBeenCalledWith(mockResponse);
  });

  test('handleShowSurveyOverview should render survey overview with score', async () => {
    req.query = { id: 'survey123', version: 'latest' };
    const mockOverview = {
      content: {
        entries: [{ answers: { '3': '5' } }, { answers: { '3': '3' } }],
      },
    };
    userFeedbackOverview.mockResolvedValue(mockOverview);

    await handleShowSurveyOverview(req, res);

    expect(userFeedbackOverview).toHaveBeenCalledWith('survey123', 'latest');
    expect(res.render).toHaveBeenCalledWith('user-feedback-overview', {
      feedbackOverview: { ...mockOverview.content, score: '4.00' },
    });
  });
});
