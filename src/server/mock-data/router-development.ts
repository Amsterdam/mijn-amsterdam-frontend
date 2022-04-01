import express, {
  CookieOptions,
  NextFunction,
  Request,
  Response,
} from 'express';
import path from 'path';
import { apiSuccessResult } from '../../universal/helpers/api';
import {
  oidcConfigDigid,
  oidcConfigEherkenning,
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_MAX_AGE_SECONDS,
} from '../config';
import { generateDevSessionCookieValue } from '../helpers/app';

export const authRouterDevelopment = express.Router();

authRouterDevelopment.get(
  '/bff/dev/auth/:authMethod/login',
  (req: Request, res: Response, next: NextFunction) => {
    const appSessionCookieOptions: CookieOptions = {
      expires: new Date(
        new Date().getTime() + OIDC_SESSION_MAX_AGE_SECONDS * 1000
      ),
      httpOnly: true,
      path: '/',
      secure: false, // Not secure for local development
      sameSite: 'lax',
    };
    let appSessionCookieValue = '';

    switch (req.params.authMethod) {
      case 'eherkenning':
        appSessionCookieValue = generateDevSessionCookieValue({
          sub: '123KVK456',
          aud: oidcConfigEherkenning.clientID ?? '',
        });
        break;
      default:
      case 'digid':
        appSessionCookieValue = generateDevSessionCookieValue({
          sub: '321BSN987',
          aud: oidcConfigDigid.clientID ?? '',
        });
        break;
    }

    res.cookie(
      OIDC_SESSION_COOKIE_NAME,
      appSessionCookieValue,
      appSessionCookieOptions
    );

    return res.redirect(`${process.env.BFF_FRONTEND_URL}`);
  }
);

authRouterDevelopment.get('/bff/dev/auth/logout', (req, res) => {
  res.clearCookie(OIDC_SESSION_COOKIE_NAME);
  return res.redirect(`${process.env.BFF_FRONTEND_URL}`);
});
