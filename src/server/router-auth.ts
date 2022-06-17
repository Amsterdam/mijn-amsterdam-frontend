import * as Sentry from '@sentry/node';
import express from 'express';
import { attemptSilentLogin, auth } from 'express-openid-connect';
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
router.use(BffEndpoints.AUTH_BASE_DIGID, nocache, auth(oidcConfigDigid));
router.use(
  BffEndpoints.AUTH_BASE_EHERKENNING,
  nocache,
  auth(oidcConfigEherkenning)
);

router.use(BffEndpoints.AUTH_BASE_SSO, nocache, async (req, res) => {
  const authMethod = req.query.authMethod;

  switch (authMethod) {
    case 'digid':
      return res.redirect(BffEndpoints.AUTH_BASE_SSO_DIGID);
    case 'eherkenning':
      return res.redirect(BffEndpoints.AUTH_BASE_SSO_EHERKENNING);
    default: {
      // No sessions found at Identify provider, let the front-end decide which SSO attempt is made.
      return res.redirect(`${process.env.BFF_FRONTEND_URL}?sso=1`);
    }
  }
});

router.use(
  BffEndpoints.AUTH_BASE_SSO_DIGID,
  attemptSilentLogin(),
  (req, res) => {
    if (req.query.checkAuthenticated) {
      return res.send(
        apiSuccessResult({ isAuthenticated: req.oidc.isAuthenticated() })
      );
    }
    return res.redirect(`${process.env.BFF_FRONTEND_URL}?authMethod=digid`);
  }
);

router.use(
  BffEndpoints.AUTH_BASE_SSO_EHERKENNING,
  attemptSilentLogin(),
  (req, res) => {
    if (req.query.checkAuthenticated) {
      return res.send(
        apiSuccessResult({ isAuthenticated: req.oidc.isAuthenticated() })
      );
    }
    return res.redirect(
      `${process.env.BFF_FRONTEND_URL}?authMethod=eherkenning`
    );
  }
);

router.get(BffEndpoints.AUTH_LOGIN_DIGID, (req, res) => {
  return res.oidc.login({
    returnTo: process.env.BFF_FRONTEND_URL + '?authMethod=digid',
    authorizationParams: {
      redirect_uri: BffEndpoints.AUTH_CALLBACK_DIGID,
    },
  });
});

router.get(BffEndpoints.AUTH_LOGIN_EHERKENNING, (req, res) => {
  return res.oidc.login({
    returnTo: process.env.BFF_FRONTEND_URL + '?authMethod=eherkenning',
    authorizationParams: {
      redirect_uri: BffEndpoints.AUTH_CALLBACK_EHERKENNING,
    },
  });
});

router.get(
  BffEndpoints.AUTH_CHECK_EHERKENNING,
  (req, res, next) =>
    req.query.sso ? attemptSilentLogin()(req, res, next) : next(),
  async (req, res) => {
    if (req.oidc.isAuthenticated()) {
      return res.send(
        apiSuccessResult({
          isAuthenticated: true,
          profileType: 'commercial',
          authMethod: 'eherkenning',
        })
      );
    }
    res.clearCookie(OIDC_SESSION_COOKIE_NAME);
    return sendUnauthorized(res);
  }
);

router.get(
  BffEndpoints.AUTH_CHECK_DIGID,
  (req, res, next) =>
    req.query.sso ? attemptSilentLogin()(req, res, next) : next(),
  async (req, res) => {
    if (req.oidc.isAuthenticated()) {
      return res.send(
        apiSuccessResult({
          isAuthenticated: true,
          profileType: 'private',
          authMethod: 'digid',
        })
      );
    }
    res.clearCookie(OIDC_SESSION_COOKIE_NAME);
    return sendUnauthorized(res);
  }
);

// AuthMethod agnostic endpoints
router.get(BffEndpoints.AUTH_CHECK, async (req, res) => {
  if (hasSessionCookie(req)) {
    try {
      const auth = await getAuth(req);
      return res.redirect(
        auth.profile.authMethod === 'eherkenning'
          ? BffEndpoints.AUTH_CHECK_EHERKENNING
          : BffEndpoints.AUTH_CHECK_DIGID
      );
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  res.clearCookie(OIDC_SESSION_COOKIE_NAME);
  return sendUnauthorized(res);
});

router.get(BffEndpoints.AUTH_TOKEN_DATA, async (req, res) => {
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

router.get(BffEndpoints.AUTH_LOGOUT, async (req, res) => {
  if (hasSessionCookie(req)) {
    const auth = await getAuth(req);
    const redirectToLogoutSpecific =
      auth.profile.authMethod === 'eherkenning'
        ? BffEndpoints.AUTH_LOGOUT_EHERKENNING
        : BffEndpoints.AUTH_LOGOUT_DIGID;
    return res.redirect(redirectToLogoutSpecific);
  }

  return res.redirect(`${process.env.BFF_FRONTEND_URL}`);
});
