export const featureToggle = {};

const BASE_ROUTE = '/services/contact';

export const routes = {
  BASE: BASE_ROUTE,
  VERIFICATION_REQUEST_CREATE: `${BASE_ROUTE}/verification-request/create`,
  VERIFICATION_REQUEST_VERIFY: `${BASE_ROUTE}/verification-request/verify`,
  CONTACT_SET_COMMUNICATIEVOORKEUR: `${BASE_ROUTE}/communicatievoorkeuren/set`,
  CONTACT_GET_COMMUNICATIEVOORKEUREN: `${BASE_ROUTE}/communicatievoorkeuren`,
} as const;
