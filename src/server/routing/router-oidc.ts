import express, { Request, Response } from 'express';
import { attemptSilentLogin, auth } from 'express-openid-connect';
import { FeatureToggle } from '../../universal/config/feature-toggles';
import { apiSuccessResult } from '../../universal/helpers/api';
import {
  OIDC_SESSION_COOKIE_NAME,
  oidcConfigDigid,
  oidcConfigEherkenning,
} from '../auth/auth-config';
import { AUTH_CALLBACK, authRoutes } from '../auth/auth-routes';

import {
  decodeOIDCToken,
  getAuth,
  getReturnToUrl,
  hasSessionCookie,
} from '../auth/auth-helpers';
import { captureException } from '../services/monitoring';
import { addToBlackList } from '../services/session-blacklist';
import { countLoggedInVisit } from '../services/visitors';
import { nocache, verifyAuthenticated } from './route-handlers';
import { sendUnauthorized } from './helpers';

export const router = express.Router();

router.use(nocache);

/**
 * DIGID Oidc config
 */
router.use(authRoutes.AUTH_BASE_DIGID, auth(oidcConfigDigid));

router.get(authRoutes.AUTH_BASE_DIGID + AUTH_CALLBACK, (req, res) =>
  res.oidc.callback({
    redirectUri: authRoutes.AUTH_CALLBACK_DIGID,
  })
);

router.post(
  authRoutes.AUTH_BASE_DIGID + AUTH_CALLBACK,
  express.urlencoded({ extended: false }),
  (req, res) =>
    res.oidc.callback({
      redirectUri: authRoutes.AUTH_CALLBACK_DIGID,
    })
);

router.use(
  authRoutes.AUTH_BASE_SSO_DIGID,
  attemptSilentLogin(),
  (req, res, next) => {
    return res.send(req.oidc.isAuthenticated());
  }
);

router.get(authRoutes.AUTH_LOGIN_DIGID, async (req, res) => {
  return res.oidc.login({
    returnTo: getReturnToUrl(req.query),
    authorizationParams: {
      redirect_uri: authRoutes.AUTH_CALLBACK_DIGID,
    },
  });
});

router.get(
  authRoutes.AUTH_CHECK_DIGID,
  verifyAuthenticated('digid', 'private')
);

router.get(authRoutes.AUTH_LOGIN_DIGID_LANDING, async (req, res) => {
  try {
    const auth = await getAuth(req);
    if (auth.profile.id) {
      countLoggedInVisit(auth.profile.id);
    }
  } catch (error) {
    captureException(error, {
      properties: {
        message: 'At Digid landing',
      },
    });
  }
  return res.redirect(process.env.MA_FRONTEND_URL + '?authMethod=digid');
});

/**
 * EHerkenning Oidc config
 */
if (FeatureToggle.eherkenningActive) {
  router.use(authRoutes.AUTH_BASE_EHERKENNING, auth(oidcConfigEherkenning));

  router.get(authRoutes.AUTH_BASE_EHERKENNING + AUTH_CALLBACK, (req, res) =>
    res.oidc.callback({
      redirectUri: authRoutes.AUTH_CALLBACK_EHERKENNING,
    })
  );

  router.post(
    authRoutes.AUTH_BASE_EHERKENNING + AUTH_CALLBACK,
    express.urlencoded({ extended: false }),
    (req, res) =>
      res.oidc.callback({
        redirectUri: authRoutes.AUTH_CALLBACK_EHERKENNING,
      })
  );

  router.use(
    authRoutes.AUTH_BASE_SSO_EHERKENNING,
    attemptSilentLogin(),
    (req, res, next) => {
      return res.send(req.oidc.isAuthenticated());
    }
  );

  router.get(authRoutes.AUTH_LOGIN_EHERKENNING, async (req, res) => {
    return res.oidc.login({
      returnTo: authRoutes.AUTH_LOGIN_EHERKENNING_LANDING,
      authorizationParams: {
        redirect_uri: authRoutes.AUTH_CALLBACK_EHERKENNING,
      },
    });
  });

  router.get(authRoutes.AUTH_LOGIN_EHERKENNING_LANDING, async (req, res) => {
    const auth = await getAuth(req);
    if (auth.profile.id) {
      countLoggedInVisit(auth.profile.id, 'eherkenning');
    }
    return res.redirect(
      process.env.MA_FRONTEND_URL + '?authMethod=eherkenning'
    );
  });

  router.get(
    authRoutes.AUTH_CHECK_EHERKENNING,
    verifyAuthenticated('eherkenning', 'commercial')
  );
}

router.use(authRoutes.AUTH_BASE_SSO, async (req, res) => {
  const authMethod = req.query.authMethod;

  switch (authMethod) {
    case 'digid':
      return res.redirect(authRoutes.AUTH_BASE_SSO_DIGID);
    case 'eherkenning':
      return res.redirect(authRoutes.AUTH_BASE_SSO_EHERKENNING);
    default: {
      // No sessions found at Identify provider, let the front-end decide which SSO attempt is made.
      return res.redirect(`${process.env.MA_FRONTEND_URL}?sso=1`);
    }
  }
});

// AuthMethod agnostic endpoints
router.get(authRoutes.AUTH_CHECK, async (req, res) => {
  if (hasSessionCookie(req)) {
    try {
      const auth = await getAuth(req);
      let redirectUrl = '';
      switch (auth.profile.authMethod) {
        case 'eherkenning':
          redirectUrl = authRoutes.AUTH_CHECK_EHERKENNING;
          break;
        case 'digid':
          redirectUrl = authRoutes.AUTH_CHECK_DIGID;
          break;
      }

      return res.redirect(redirectUrl);
    } catch (error) {
      captureException(error);
    }
  }

  res.clearCookie(OIDC_SESSION_COOKIE_NAME);
  return sendUnauthorized(res);
});

router.get(authRoutes.AUTH_TOKEN_DATA, async (req, res) => {
  if (hasSessionCookie(req)) {
    try {
      const auth = await getAuth(req);
      return res.send(
        apiSuccessResult({
          tokenData: await decodeOIDCToken(auth.token),
          token: auth.token,
          profile: auth.profile,
        })
      );
    } catch (error) {
      captureException(error);
    }
  }

  return sendUnauthorized(res);
});

router.get(authRoutes.AUTH_LOGOUT, async (req, res) => {
  let redirectUrl = `${process.env.MA_FRONTEND_URL}`;
  let authMethodRequested = req.query.authMethod;

  if (hasSessionCookie(req) && !authMethodRequested) {
    const auth = await getAuth(req);
    authMethodRequested = auth.profile.authMethod;
  }

  switch (authMethodRequested) {
    case 'eherkenning':
      redirectUrl = authRoutes.AUTH_LOGOUT_EHERKENNING;
      break;
    case 'digid':
      redirectUrl = authRoutes.AUTH_LOGOUT_DIGID;
      break;
  }

  return res.redirect(redirectUrl);
});

function logout(postLogoutRedirectUrl: string, doIDPLogout: boolean = true) {
  return async (req: Request, res: Response) => {
    if (req.oidc.isAuthenticated() && doIDPLogout) {
      const auth = await getAuth(req);
      // Add the session ID to a blacklist. This way the jwt id_token, which itself has longer lifetime, cannot be reused after logging out at IDP.
      if (auth.profile.sid) {
        await addToBlackList(auth.profile.sid);
      }
      return res.oidc.logout({
        returnTo: postLogoutRedirectUrl,
        logoutParams: {
          id_token_hint: !FeatureToggle.oidcLogoutHintActive
            ? auth.token
            : null,
          logout_hint: FeatureToggle.oidcLogoutHintActive
            ? auth.profile.sid
            : null,
        },
      });
    }

    // Destroy the session context
    (req as any)[OIDC_SESSION_COOKIE_NAME] = undefined;
    res.clearCookie(OIDC_SESSION_COOKIE_NAME);

    return res.redirect(postLogoutRedirectUrl);
  };
}

router.get(authRoutes.AUTH_LOGOUT_DIGID, logout(process.env.MA_FRONTEND_URL!));

router.get(
  authRoutes.AUTH_LOGOUT_EHERKENNING,
  logout(process.env.MA_FRONTEND_URL!)
);

router.get(
  authRoutes.AUTH_LOGOUT_EHERKENNING_LOCAL,
  logout(process.env.MA_FRONTEND_URL!, false)
);
