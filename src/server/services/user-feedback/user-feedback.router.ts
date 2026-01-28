import express from 'express';

import {
  handleFetchSurvey,
  handleFetchSurveyOverview,
  handleShowSurveyOverview,
  handleUserFeedbackSubmission,
} from './user-feedback.route-handlers';
import { featureToggle, routes } from './user-feedback.service-config';
import { createBFFRouter } from '../../routing/route-helpers';

const userFeedbackRouterProtected = createBFFRouter({
  id: 'protected-user-feedback-router',
  isEnabled: featureToggle.router.protected.isEnabled,
});

userFeedbackRouterProtected.get(
  routes.protected.USER_FEEDBACK_SURVEY,
  handleFetchSurvey
);

userFeedbackRouterProtected.post(
  routes.protected.USER_FEEDBACK_SUBMIT,
  express.urlencoded({ extended: true }),
  handleUserFeedbackSubmission
);

const userFeedbackRouterAdmin = createBFFRouter({
  id: 'admin-user-feedback-router',
  isEnabled: featureToggle.router.admin.isEnabled,
});

userFeedbackRouterAdmin.get(
  routes.admin.USER_FEEDBACK_OVERVIEW_TABLE,
  handleShowSurveyOverview
);

userFeedbackRouterAdmin.get(
  routes.admin.USER_FEEDBACK_OVERVIEW,
  handleFetchSurveyOverview
);

export const userFeedbackRouter = {
  protected: userFeedbackRouterProtected,
  admin: userFeedbackRouterAdmin,
};
