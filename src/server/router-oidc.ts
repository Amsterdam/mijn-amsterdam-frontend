import express, { Request, Response, RequestHandler } from 'express';
import { auth, requiresAuth } from 'express-openid-connect';
import { FeatureToggle } from '../universal/config';
import { apiSuccessResult } from '../universal/helpers';
import {
  AUTH_BASE_EHERKENNING,
  AUTH_CALLBACK,
  BffEndpoints,
  OIDC_SESSION_COOKIE_NAME,
  oidcConfigDigid,
  oidcConfigEherkenning,
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
import { captureException } from './services/monitoring';
import { addToBlackList } from './services/session-blacklist';
import { countLoggedInVisit } from './services/visitors';

export const router = express.Router();

router.use(nocache);

/**
 * DIGID Oidc config
 */

function getConfigByReq(req: Request) {
  const isEherkenning = req.url.includes(AUTH_BASE_EHERKENNING);
  if (isEherkenning) {
    return oidcConfigEherkenning;
  }
  return oidcConfigDigid;
}

const authInstances = new Map();

router.use((req, res, next) => {
  const config = getConfigByReq(req);
  let authRequestHandler: RequestHandler;
  if (!authInstances.has(config)) {
    authRequestHandler = auth(config);
    authInstances.set(config, authRequestHandler);
  } else {
    authRequestHandler = authInstances.get(config);
  }
  authRequestHandler(req, res, next);
});

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

  router.get(BffEndpoints.AUTH_LOGIN_EHERKENNING, async (req, res) => {
    if (!req.oidc.isAuthenticated()) {
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

// AuthMethod agnostic endpoints
router.get(BffEndpoints.AUTH_CHECK, async (req, res) => {
  try {
    const auth = await getAuth(req);
    console.log('auth check ', auth);
    let redirectUrl = '';
    switch (auth.profile.authMethod) {
      case 'eherkenning':
        redirectUrl = BffEndpoints.AUTH_CHECK_EHERKENNING;
        break;
      case 'digid':
        redirectUrl = BffEndpoints.AUTH_CHECK_DIGID;
        break;
    }

    return res.redirect(redirectUrl);
  } catch (error) {
    captureException(error);
  }

  return sendUnauthorized(res);
});

router.get(BffEndpoints.AUTH_TOKEN_DATA, requiresAuth(), async (req, res) => {
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
