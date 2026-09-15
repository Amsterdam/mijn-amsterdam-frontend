import { BFF_ADMIN_API_BASE_URL } from '../../config.ts';

export const BFFApiUrls = {
  INDEX: BFF_ADMIN_API_BASE_URL,
  ACCOUNT: `${BFF_ADMIN_API_BASE_URL}/account`,
  USER_FEEDBACK: `${BFF_ADMIN_API_BASE_URL}/user-feedback/overview`,
  USER_FEEDBACK_HANDOFF_CONFIG: `${BFF_ADMIN_API_BASE_URL}/user-feedback/handoff-config`,
  USER_FEEDBACK_CREATE_TICKET: (entryId: number) =>
    `${BFF_ADMIN_API_BASE_URL}/user-feedback/${entryId}/create-ticket`,
  USER_FEEDBACK_DELETE_TICKET: (entryId: number) =>
    `${BFF_ADMIN_API_BASE_URL}/user-feedback/${entryId}/delete-ticket`,
  USER_FEEDBACK_HANDOFF_DEPARTMENT: (entryId: number) =>
    `${BFF_ADMIN_API_BASE_URL}/user-feedback/${entryId}/handoff-department`,
} as const;

export const LOGIN_URL = `${BFF_ADMIN_API_BASE_URL}/auth/signin`;
export const LOGOUT_URL = `${BFF_ADMIN_API_BASE_URL}/auth/signout`;
export const AUTH_API_URL = `${BFF_ADMIN_API_BASE_URL}/auth/check`;
