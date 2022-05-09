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
import {
  decodeOIDCToken,
  getAuth,
  hasSessionCookie,
  nocache,
  sendUnauthorized,
} from './helpers/app';

export const router = express.Router();

export const isAuthenticated =
  () =>
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (hasSessionCookie(req)) {
      try {
        const a = await getAuth(req);
        return next();
      } catch (error) {
        Sentry.captureException(error);
      }
    }
    return sendUnauthorized(res);
  };

// Enable OIDC
router.use(BffEndpoints.PUBLIC_AUTH_BASE_DIGID, nocache, auth(oidcConfigDigid));
router.use(
  BffEndpoints.PUBLIC_AUTH_BASE_EHERKENNING,
  nocache,
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

router.get(BffEndpoints.PUBLIC_AUTH_CHECK_EHERKENNING, async (req, res) => {
  if (req.oidc.isAuthenticated()) {
    return res.send(apiSuccessResult({ isAuthenticated: true }));
  }
  return sendUnauthorized(res);
});

router.get(BffEndpoints.PUBLIC_AUTH_CHECK_DIGID, async (req, res) => {
  if (req.oidc.isAuthenticated()) {
    return res.send(apiSuccessResult({ isAuthenticated: true }));
  }
  return sendUnauthorized(res);
});

// AuthMethod agnostic endpoints
router.get(BffEndpoints.PUBLIC_AUTH_CHECK, async (req, res) => {
  if (hasSessionCookie(req)) {
    try {
      const auth = await getAuth(req);

      return res.redirect(
        auth.profile.authMethod === 'eherkenning'
          ? BffEndpoints.PUBLIC_AUTH_CHECK_EHERKENNING
          : BffEndpoints.PUBLIC_AUTH_CHECK_DIGID
      );
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  res.clearCookie(OIDC_SESSION_COOKIE_NAME);
  return sendUnauthorized(res);
});

router.get(BffEndpoints.PUBLIC_AUTH_TOKEN_DATA, async (req, res) => {
  if (hasSessionCookie(req)) {
    try {
      const auth = await getAuth(req);
      return res.send(apiSuccessResult(await decodeOIDCToken(auth.token)));
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  return sendUnauthorized(res);
});

router.get(BffEndpoints.PUBLIC_AUTH_LOGOUT, async (req, res) => {
  if (hasSessionCookie(req)) {
    const auth = await getAuth(req);
    const redirectToLogoutSpecific =
      auth.profile.authMethod === 'eherkenning'
        ? BffEndpoints.PUBLIC_AUTH_LOGOUT_EHERKENNING
        : BffEndpoints.PUBLIC_AUTH_LOGOUT_DIGID;
    return res.redirect(redirectToLogoutSpecific);
  }

  return res.redirect(`${process.env.BFF_FRONTEND_URL}`);
});
