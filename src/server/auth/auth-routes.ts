import { getFromEnv } from '../helpers/env.ts';

export const AUTH_BASE = '/api/v1/auth';
export const AUTH_BASE_DIGID = `${AUTH_BASE}/digid`;
export const AUTH_BASE_EHERKENNING = `${AUTH_BASE}/eherkenning`;

export const AUTH_BASE_SSO = `${AUTH_BASE}/sso`;
export const AUTH_BASE_SSO_DIGID = `${AUTH_BASE}/digid/sso`;
export const AUTH_BASE_SSO_EHERKENNING = `${AUTH_BASE}/eherkenning/sso`;

export const AUTH_LOGIN = `${getFromEnv('BFF_OIDC_LOGIN', false) ?? '/login'}`;
export const AUTH_LOGOUT = `${getFromEnv('BFF_OIDC_LOGOUT', false) ?? '/logout'}`;
export const AUTH_CALLBACK = `${getFromEnv('BFF_OIDC_CALLBACK', false) ?? '/callback'}`;

export const BFF_OIDC_BASE_URL = `${
  getFromEnv('BFF_OIDC_BASE_URL') ?? 'https://mijn.amsterdam.nl'
}`;

export const BFF_OIDC_ISSUER_BASE_URL = `${getFromEnv('BFF_OIDC_ISSUER_BASE_URL')}`;

export const authRoutes = {
  // start: OIDC config
  AUTH_BASE_DIGID,
  AUTH_BASE_EHERKENNING,
  AUTH_BASE_SSO,
  AUTH_BASE_SSO_DIGID,
  AUTH_BASE_SSO_EHERKENNING,

  // Digid
  AUTH_CALLBACK_DIGID: BFF_OIDC_BASE_URL + AUTH_BASE_DIGID + AUTH_CALLBACK,
  AUTH_LOGIN_DIGID: AUTH_BASE_DIGID + AUTH_LOGIN,
  AUTH_LOGIN_DIGID_LANDING: AUTH_BASE_DIGID + AUTH_LOGIN + '/landing',
  AUTH_LOGOUT_DIGID: AUTH_BASE_DIGID + AUTH_LOGOUT,

  // EHerkenning
  AUTH_CALLBACK_EHERKENNING:
    BFF_OIDC_BASE_URL + AUTH_BASE_EHERKENNING + AUTH_CALLBACK,
  AUTH_LOGIN_EHERKENNING: AUTH_BASE_EHERKENNING + AUTH_LOGIN,
  AUTH_LOGIN_EHERKENNING_LANDING:
    AUTH_BASE_EHERKENNING + AUTH_LOGIN + '/landing',
  AUTH_LOGOUT_EHERKENNING: AUTH_BASE_EHERKENNING + AUTH_LOGOUT,
  AUTH_LOGOUT_EHERKENNING_LOCAL:
    AUTH_BASE_EHERKENNING + `${AUTH_LOGOUT}/local-session`,

  // Application specific urls
  AUTH_CHECK: `${AUTH_BASE}/check`,
  AUTH_CHECK_EHERKENNING: `${AUTH_BASE_EHERKENNING}/check`,
  AUTH_CHECK_DIGID: `${AUTH_BASE_DIGID}/check`,
  AUTH_TOKEN_DATA: `${AUTH_BASE}/token-data`,
  AUTH_TOKEN_DATA_EHERKENNING: `${AUTH_BASE_EHERKENNING}/token-data`,
  AUTH_TOKEN_DATA_DIGID: `${AUTH_BASE_DIGID}/token-data`,
  AUTH_LOGOUT: `${AUTH_BASE}/logout`,
  // end: OIDC config
};
