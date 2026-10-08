import express from 'express';

import {
  handleCreateJiraTicket,
  handleDeleteJiraTicketMeta,
  handleFetchSurvey,
  handleShowSurveyOverview,
  handleHandoffFeedbackToDepartment,
  handleUserFeedbackHandoffConfig,
  handleUserFeedbackSubmission,
} from './user-feedback.route-handlers.ts';
import { featureToggle, routes } from './user-feedback.service-config.ts';
import { checkIfDbEnabled } from '../../routing/route-handlers.ts';
import { createBFFRouter } from '../../routing/route-helpers.ts';

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

userFeedbackRouterAdmin.use(checkIfDbEnabled);

userFeedbackRouterAdmin.get(
  routes.admin.USER_FEEDBACK_OVERVIEW,
  handleShowSurveyOverview
);

userFeedbackRouterAdmin.get(
  routes.admin.USER_FEEDBACK_HANDOFF_CONFIG,
  handleUserFeedbackHandoffConfig
);

userFeedbackRouterAdmin.post(
  routes.admin.USER_FEEDBACK_CREATE_TICKET,
  handleCreateJiraTicket
);

userFeedbackRouterAdmin.delete(
  routes.admin.USER_FEEDBACK_DELETE_TICKET,
  handleDeleteJiraTicketMeta
);

userFeedbackRouterAdmin.post(
  routes.admin.USER_FEEDBACK_HANDOFF_DEPARTMENT,
  handleHandoffFeedbackToDepartment
);

export const userFeedbackRouter = {
  protected: userFeedbackRouterProtected,
  admin: userFeedbackRouterAdmin,
};
