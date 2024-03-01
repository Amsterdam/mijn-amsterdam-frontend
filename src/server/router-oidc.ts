import * as Sentry from '@sentry/node';
import express, { Request, Response } from 'express';
import { attemptSilentLogin, auth } from 'express-openid-connect';
import { FeatureToggle, IS_PRODUCTION } from '../universal/config';
import { apiSuccessResult } from '../universal/helpers';
import {
  AUTH_CALLBACK,
  BffEndpoints,
  OIDC_SESSION_COOKIE_NAME,
  oidcConfigDigid,
  oidcConfigEherkenning,
  oidcConfigYivi,
} from './config';
import {
  decodeOIDCToken,
  getAuth,
  hasSessionCookie,
  isRequestAuthenticated,
  nocache,
  sendUnauthorized,
  verifyAuthenticated,
} from './helpers/app';
import { countLoggedInVisit } from './services/visitors';
import { addToBlackList } from './services/session-blacklist';

export const router = express.Router();

router.use(nocache);

/**
 * DIGID Oidc config
 */
router.use(BffEndpoints.AUTH_BASE_DIGID, auth(oidcConfigDigid));

router.get(BffEndpoints.AUTH_BASE_DIGID + AUTH_CALLBACK, (req, res) =>
  res.oidc.callback({
    redirectUri: BffEndpoints.AUTH_CALLBACK_DIGID,
  })
);

router.post(
  BffEndpoints.AUTH_BASE_DIGID + AUTH_CALLBACK,
  express.urlencoded({ extended: false }),
  (req, res) =>
    res.oidc.callback({
      redirectUri: BffEndpoints.AUTH_CALLBACK_DIGID,
    })
);

router.use(
  BffEndpoints.AUTH_BASE_SSO_DIGID,
  attemptSilentLogin(),
  (req, res, next) => {
    return res.send(req.oidc.isAuthenticated());
  }
);

router.get(BffEndpoints.AUTH_LOGIN_DIGID, async (req, res) => {
  if (!(await isRequestAuthenticated(req, 'digid'))) {
    return res.oidc.login({
      returnTo: BffEndpoints.AUTH_LOGIN_DIGID_LANDING,
      authorizationParams: {
        redirect_uri: BffEndpoints.AUTH_CALLBACK_DIGID,
      },
    });
  }
  return res.redirect(process.env.MA_FRONTEND_URL + '?authMethod=digid');
});

router.get(
  BffEndpoints.AUTH_CHECK_DIGID,
  verifyAuthenticated('digid', 'private')
);

router.get(BffEndpoints.AUTH_LOGIN_DIGID_LANDING, async (req, res) => {
  try {
    const auth = await getAuth(req);
    if (auth.profile.id) {
      countLoggedInVisit(auth.profile.id);
    }
  } catch (error) {
    Sentry.captureException(error, {
      extra: {
        at: 'Digid landing',
      },
    });
  }
  return res.redirect(process.env.MA_FRONTEND_URL + '?authMethod=digid');
});

/**
 * EHerkenning Oidc config
 */
if (FeatureToggle.eherkenningActive) {
  router.use(BffEndpoints.AUTH_BASE_EHERKENNING, auth(oidcConfigEherkenning));

  router.get(BffEndpoints.AUTH_BASE_EHERKENNING + AUTH_CALLBACK, (req, res) =>
    res.oidc.callback({
      redirectUri: BffEndpoints.AUTH_CALLBACK_EHERKENNING,
    })
  );

  router.post(
    BffEndpoints.AUTH_BASE_EHERKENNING + AUTH_CALLBACK,
    express.urlencoded({ extended: false }),
    (req, res) =>
      res.oidc.callback({
        redirectUri: BffEndpoints.AUTH_CALLBACK_EHERKENNING,
      })
  );

  router.use(
    BffEndpoints.AUTH_BASE_SSO_EHERKENNING,
    attemptSilentLogin(),
    (req, res, next) => {
      return res.send(req.oidc.isAuthenticated());
    }
  );

  router.get(BffEndpoints.AUTH_LOGIN_EHERKENNING, async (req, res) => {
    if (!(await isRequestAuthenticated(req, 'eherkenning'))) {
      return res.oidc.login({
        returnTo: BffEndpoints.AUTH_LOGIN_EHERKENNING_LANDING,
        authorizationParams: {
          redirect_uri: BffEndpoints.AUTH_CALLBACK_EHERKENNING,
        },
      });
    }
    return res.redirect(
      process.env.MA_FRONTEND_URL + '?authMethod=eherkenning'
    );
  });

  router.get(BffEndpoints.AUTH_LOGIN_EHERKENNING_LANDING, async (req, res) => {
    const auth = await getAuth(req);
    if (auth.profile.id) {
      countLoggedInVisit(auth.profile.id, 'eherkenning');
    }
    return res.redirect(
      process.env.MA_FRONTEND_URL + '?authMethod=eherkenning'
    );
  });

  router.get(
    BffEndpoints.AUTH_CHECK_EHERKENNING,
    verifyAuthenticated('eherkenning', 'commercial')
  );
}

/**
 * YIVI Oidc config
 */
if (FeatureToggle.yiviActive) {
  router.use(BffEndpoints.AUTH_BASE_YIVI, auth(oidcConfigYivi));

  router.get(BffEndpoints.AUTH_BASE_YIVI + AUTH_CALLBACK, (req, res) =>
    res.oidc.callback({
      redirectUri: BffEndpoints.AUTH_CALLBACK_YIVI,
    })
  );

  router.post(
    BffEndpoints.AUTH_BASE_YIVI + AUTH_CALLBACK,
    express.urlencoded({ extended: false }),
    (req, res) =>
      res.oidc.callback({
        redirectUri: BffEndpoints.AUTH_CALLBACK_YIVI,
      })
  );

  router.get(BffEndpoints.AUTH_LOGIN_YIVI, async (req, res) => {
    try {
      if (!(await isRequestAuthenticated(req, 'yivi'))) {
        return res.oidc.login({
          returnTo: BffEndpoints.AUTH_LOGIN_YIVI_LANDING,
          authorizationParams: {
            redirect_uri: BffEndpoints.AUTH_CALLBACK_YIVI,
          },
        });
      }
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          at: 'Eherkenning landing',
        },
      });
    }
    return res.redirect(process.env.MA_FRONTEND_URL + '?authMethod=yivi');
  });

  router.get(BffEndpoints.AUTH_LOGIN_YIVI_LANDING, async (req, res) => {
    try {
      const auth = await getAuth(req);
      if (auth.profile.id) {
        countLoggedInVisit(auth.profile.id, 'yivi');
      }
    } catch (error) {
      Sentry.captureException(error, {
        extra: {
          at: 'Yivi landing',
        },
      });
    }
    return res.redirect(`${process.env.BFF_OIDC_YIVI_POST_LOGIN_REDIRECT}`);
  });

  router.get(
    BffEndpoints.AUTH_CHECK_YIVI,
    verifyAuthenticated('yivi', 'private-attributes')
  );
}

router.use(BffEndpoints.AUTH_BASE_SSO, async (req, res) => {
  const authMethod = req.query.authMethod;

  switch (authMethod) {
    case 'digid':
      return res.redirect(BffEndpoints.AUTH_BASE_SSO_DIGID);
    case 'eherkenning':
      return res.redirect(BffEndpoints.AUTH_BASE_SSO_EHERKENNING);
    default: {
      // No sessions found at Identify provider, let the front-end decide which SSO attempt is made.
      return res.redirect(`${process.env.MA_FRONTEND_URL}?sso=1`);
    }
  }
});

// AuthMethod agnostic endpoints
router.get(BffEndpoints.AUTH_CHECK, async (req, res) => {
  if (hasSessionCookie(req)) {
    try {
      const auth = await getAuth(req);
      let redirectUrl = '';
      switch (auth.profile.authMethod) {
        case 'eherkenning':
          redirectUrl = BffEndpoints.AUTH_CHECK_EHERKENNING;
          break;
        case 'digid':
          redirectUrl = BffEndpoints.AUTH_CHECK_DIGID;
          break;
        case 'yivi':
          redirectUrl = BffEndpoints.AUTH_CHECK_YIVI;
          break;
      }

      return res.redirect(redirectUrl);
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
      return res.send(
        apiSuccessResult({
          tokenData: await decodeOIDCToken(auth.token),
          token: auth.token,
          profile: auth.profile,
        })
      );
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  return sendUnauthorized(res);
});

router.get(BffEndpoints.AUTH_LOGOUT, async (req, res) => {
  let redirectUrl = `${process.env.MA_FRONTEND_URL}`;
  let authMethodRequested = req.query.authMethod;

  if (hasSessionCookie(req) && !authMethodRequested) {
    const auth = await getAuth(req);
    authMethodRequested = auth.profile.authMethod;
  }

  switch (authMethodRequested) {
    case 'eherkenning':
      redirectUrl = BffEndpoints.AUTH_LOGOUT_EHERKENNING;
      break;
    case 'digid':
      redirectUrl = BffEndpoints.AUTH_LOGOUT_DIGID;
      break;
    case 'yivi':
      redirectUrl = BffEndpoints.AUTH_LOGOUT_YIVI;
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

router.get(
  BffEndpoints.AUTH_LOGOUT_DIGID,
  logout(process.env.MA_FRONTEND_URL!)
);

router.get(
  BffEndpoints.AUTH_LOGOUT_EHERKENNING,
  logout(process.env.MA_FRONTEND_URL!)
);

router.get(
  BffEndpoints.AUTH_LOGOUT_EHERKENNING_LOCAL,
  logout(process.env.MA_FRONTEND_URL!, false)
);

router.get(
  BffEndpoints.AUTH_LOGOUT_YIVI,
  logout(process.env.BFF_OIDC_YIVI_POST_LOGOUT_REDIRECT!)
);
