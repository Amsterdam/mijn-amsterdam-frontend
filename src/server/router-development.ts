import express, {
  CookieOptions,
  NextFunction,
  Request,
  Response,
} from 'express';
import {
  OIDC_SESSION_COOKIE_NAME,
  OIDC_SESSION_MAX_AGE_SECONDS,
} from './config';
import { AuthProfile, generateDevSessionCookieValue } from './helpers/app';

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
    const authMethod = req.params.authMethod as AuthProfile['authMethod'];
    const userId = `xxx-${authMethod}-xxx`;
    const appSessionCookieValue = generateDevSessionCookieValue(
      authMethod,
      userId
    );

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
