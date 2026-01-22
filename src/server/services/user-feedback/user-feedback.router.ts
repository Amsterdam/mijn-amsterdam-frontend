import express from 'express';

import {
  handleFetchSurvey,
  handleFetchSurveyOverview,
  handleUserFeedbackSubmission,
} from './user-feedback.route-handlers';
import { featureToggle, routes } from './user-feedback.service-config';
import { IS_TAP } from '../../../universal/config/env';
import { conditional } from '../../helpers/middleware';
import { OAuthVerificationHandler } from '../../routing/route-handlers';
import { createBFFRouter } from '../../routing/route-helpers';

const userFeedbackRouterProtected = createBFFRouter({
  id: 'protected-user-feedback-router',
  isEnabled: featureToggle.router.protected.isEnabled,
});

userFeedbackRouterProtected.get(
  routes.protected.USER_FEEDBACK_SURVEY,
  handleFetchSurvey
);

userFeedbackRouterProtected.get(
  routes.protected.USER_FEEDBACK_OVERVIEW,
  conditional(IS_TAP, OAuthVerificationHandler()),
  handleFetchSurveyOverview
);

userFeedbackRouterProtected.post(
  routes.protected.USER_FEEDBACK_SUBMIT,
  express.urlencoded({ extended: true }),
  handleUserFeedbackSubmission
);

export const userFeedbackRouter = {
  protected: userFeedbackRouterProtected,
};
