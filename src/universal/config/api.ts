export const LOGIN_URL = process.env.REACT_APP_LOGIN_URL || '/api/login';
export const LOGIN_URL_DIGID = `${LOGIN_URL}?target=digid`;
export const LOGIN_URL_EHERKENNING = `${LOGIN_URL}?target=eherkenning`;
export const LOGOUT_URL = process.env.REACT_APP_LOGOUT_URL || '/logout';
export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || '/api';
export const BFF_API_BASE_URL =
  process.env.REACT_APP_BFF_API_BASE_URL || '/api/bff';
export const DATAPUNT_API_BASE_URL = process.env.REACT_APP_DATAPUNT_API_URL;
export const AUTH_API_URL = `${API_BASE_URL}/auth/check`;
