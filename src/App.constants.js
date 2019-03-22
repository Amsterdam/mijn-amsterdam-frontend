export const Chapters = {
  ROOT: 'ROOT',
  BURGERZAKEN: 'BURGERZAKEN',
  WONEN: 'WONEN',
  BELASTINGEN: 'BELASTINGEN',
  GEZONDHEID: 'GEZONDHEID',
  INKOMEN: 'INKOMEN',
  PROFILE: 'PROFILE',

  // TODO: Clarify what this is about
  TIPS: 'tips',
  MIJN_UPDATES: 'mijn-updates',
};

export const AppRoutes = {
  ROOT: '/',
  BURGERZAKEN: '/burgerzaken',
  WONEN: '/wonen',
  BELASTINGEN: '/belastingen',
  GEZONDHEID: '/gezondheid',
  INKOMEN: '/inkomen',
  PROFILE: '/profile',

  // NOTE: Route components not implemented, subject to change
  TIPS: '/tips',
  MIJN_UPDATES: '/updates',
};

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const ApiUrls = {
  MIJN_UPDATES: `${API_BASE_URL}/profiel/mijn-updates`,
  BRP: `${API_BASE_URL}/brp/brp`,
  WMO: `${API_BASE_URL}/wmoned/voorzieningen`,
  FOCUS: `${API_BASE_URL}/focus/aanvragen`,
  AUTH: `${API_BASE_URL}/auth`,
  ERFPACHT: `${API_BASE_URL}/erfpacht/check-erfpacht`,
};

// See https://date-fns.org/v1.30.1/docs/format for more formatting options
export const DEFAULT_DATE_FORMAT = 'DD MMM YYYY';
