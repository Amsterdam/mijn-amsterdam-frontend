import { RETURNTO_AMSAPP_STADSPAS_APP_LANDING } from '../../auth/auth-after-redirect-returnto.ts';
import { authRoutes } from '../../auth/auth-routes.ts';
import { MA_FRONTEND_URL } from '../../config/app.ts';
import { getFromEnv } from '../../helpers/env.ts';
import { generateFullApiUrlBFF } from '../../routing/route-helpers.ts';

export const nonce = getFromEnv('BFF_AMSAPP_NONCE')!; // This nonce is whitelisted in the CSP config
export const baseRenderProps = {
  nonce,
  urlToImage: `${MA_FRONTEND_URL}/img/logo-amsterdam.svg`,
  urlToCSS: `${MA_FRONTEND_URL}/css/amsapp-landing.css`,
  get logoutUrl() {
    // Stadspas app landing is used as the default returnTo for all AMSAPP routes that require Digid login/logout.
    return generateFullApiUrlBFF(authRoutes.AUTH_LOGOUT_DIGID, [
      { returnTo: RETURNTO_AMSAPP_STADSPAS_APP_LANDING },
    ]);
  },
} as const;

export const AMSAPP_PROTOCOL = 'amsterdam://';
