import * as Sentry from '@sentry/node';
import express from 'express';
import { auth } from 'express-openid-connect';
import { apiSuccessResult } from '../universal/helpers';
import {
  BffEndpoints,
  oidcConfigDigid,
  oidcConfigEherkenning,
  OIDC_SESSION_COOKIE_NAME,
} from './config';
import { getAuth, sendUnauthorized } from './helpers/app';

export const router = express.Router();

export const isAuthenticated =
  () =>
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (OIDC_SESSION_COOKIE_NAME in req.cookies) {
      try {
        const a = getAuth(req);
        return next();
      } catch (error) {
        Sentry.captureException(error);
      }
    }
    return sendUnauthorized(res);
  };

// Enable OIDC
router.use(BffEndpoints.PUBLIC_AUTH_BASE_DIGID, auth(oidcConfigDigid));
router.use(
  BffEndpoints.PUBLIC_AUTH_BASE_EHERKENNING,
  auth(oidcConfigEherkenning)
);

router.get(BffEndpoints.PUBLIC_AUTH_LOGIN_DIGID, (req, res) => {
  return res.oidc.login({
    returnTo: process.env.BFF_FRONTEND_URL,
    authorizationParams: {
      // Specify full url here, the default redirect url is constructed of base_url and routes.callback which doesn't take the router base path into account whilst the auth() middleware does.
      redirect_uri: BffEndpoints.PUBLIC_AUTH_CALLBACK_DIGID,
    },
  });
});

router.get(BffEndpoints.PUBLIC_AUTH_LOGIN_EHERKENNING, (req, res) => {
  return res.oidc.login({
    returnTo: process.env.BFF_FRONTEND_URL,
    authorizationParams: {
      // Specify full url here, the default redirect url is constructed of base_url and routes.callback which doesn't take the router base path into account whilst the auth() middleware does.
      redirect_uri: BffEndpoints.PUBLIC_AUTH_CALLBACK_EHERKENNING,
    },
  });
});

router.get(BffEndpoints.PUBLIC_AUTH_CHECK, (req, res) => {
  if (OIDC_SESSION_COOKIE_NAME in req.cookies) {
    try {
      const auth = getAuth(req);
      return res.send(
        apiSuccessResult({ ...auth.profile, isAuthenticated: true })
      );
    } catch (error) {
      console.error(error);
    }
  }

  return sendUnauthorized(res);
});

router.get(BffEndpoints.PUBLIC_AUTH_LOGOUT, (req, res) => {
  if (OIDC_SESSION_COOKIE_NAME in req.cookies) {
    const auth = getAuth(req);
    const redirectToLogoutSpecific =
      auth.profile.authMethod === 'eherkenning'
        ? BffEndpoints.PUBLIC_AUTH_LOGOUT_EHERKENNING
        : BffEndpoints.PUBLIC_AUTH_LOGOUT_DIGID;
    return res.redirect(redirectToLogoutSpecific);
  }

  return res.redirect(`${process.env.BFF_FRONTEND_URL}`);
});
