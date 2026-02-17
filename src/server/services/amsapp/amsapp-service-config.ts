import { RETURNTO_AMSAPP_STADSPAS_APP_LANDING } from '../../auth/auth-config';
import { authRoutes } from '../../auth/auth-routes';
import { getFromEnv } from '../../helpers/env';
import { generateFullApiUrlBFF } from '../../routing/route-helpers';

export const AMSAPP_BASE_PATH = '/services/amsapp';
export const maFrontendUrl = getFromEnv('MA_FRONTEND_URL')!;

export const logoutUrl = generateFullApiUrlBFF(authRoutes.AUTH_LOGOUT_DIGID, [
  { returnTo: RETURNTO_AMSAPP_STADSPAS_APP_LANDING }, // Stadspas app landing is used as the default returnTo for all AMSAPP routes that require Digid login/logout.
]);

export const nonce = getFromEnv('BFF_AMSAPP_NONCE')!; // This nonce is whitelisted in the CSP config
export const baseRenderProps = {
  nonce,
  urlToImage: `${maFrontendUrl}/img/logo-amsterdam.svg`,
  urlToCSS: `${maFrontendUrl}/css/amsapp-landing.css`,
  logoutUrl,
} as const;

export const AMSAPP_PROTOCOl = 'amsterdam://';
