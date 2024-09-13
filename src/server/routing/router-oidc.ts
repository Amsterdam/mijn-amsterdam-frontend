import express, { Request, RequestHandler, Response } from 'express';
import { ConfigParams, requiresAuth } from 'express-openid-connect';
import { FeatureToggle } from '../../universal/config/feature-toggles';
import { apiSuccessResult } from '../../universal/helpers/api';
import {
  OIDC_SESSION_COOKIE_NAME,
  oidcConfigDigid,
  oidcConfigEherkenning,
  openIdAuth,
} from '../auth/auth-config';
import {
  createLogoutHandler,
  getAuth,
  getReturnToUrl,
  hasSessionCookie,
} from '../auth/auth-helpers';
import {
  AUTH_BASE_EHERKENNING,
  AUTH_CALLBACK,
  authRoutes,
} from '../auth/auth-routes';
import { captureException } from '../services/monitoring';
import { countLoggedInVisit } from '../services/visitors';
import { nocache, verifyAuthenticated } from './route-handlers';
import { sendUnauthorized } from './route-helpers';

export const oidcRouter = express.Router();

// Prevent caching the responses from this oidcRouter.
oidcRouter.use(nocache);

/**
 * DIGID Oidc config
 */

function getOidcConfigByRequest(req: Request) {
  const isEherkenning = req.url.includes(AUTH_BASE_EHERKENNING);

  let oidConfig: ConfigParams = oidcConfigDigid;

  if (isEherkenning) {
    oidConfig = oidcConfigEherkenning;
  }

  return oidConfig;
}

const authInstances = new Map();

// Determine which OIDC config should be used.
oidcRouter.use((req, res, next) => {
  const config = getOidcConfigByRequest(req);

  let authRequestHandler: RequestHandler;

  // Makes sure we only initialize Auth per authMethod once.
  if (!authInstances.has(config)) {
    authRequestHandler = openIdAuth(config);
    authInstances.set(config, authRequestHandler);
  } else {
    authRequestHandler = authInstances.get(config);
  }

  return authRequestHandler(req, res, next);
});

oidcRouter.get(
  authRoutes.AUTH_BASE_DIGID + AUTH_CALLBACK,
  (req: Request, res: Response) => {
    return res.oidc.callback({
      redirectUri: authRoutes.AUTH_CALLBACK_DIGID,
    });
  }
);

oidcRouter.get(
  authRoutes.AUTH_LOGIN_DIGID,
  async (req: Request, res: Response) => {
    return res.oidc.login({
      returnTo: getReturnToUrl(req.query),
      authorizationParams: {
        redirect_uri: authRoutes.AUTH_CALLBACK_DIGID,
      },
    });
  }
);

oidcRouter.get(
  authRoutes.AUTH_LOGIN_DIGID_LANDING,
  async (req: Request, res: Response) => {
    try {
      const auth = getAuth(req);
      if (auth?.profile.id) {
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
  }
);

/**
 * EHerkenning Oidc config
 */
if (FeatureToggle.eherkenningActive) {
  oidcRouter.get(
    authRoutes.AUTH_BASE_EHERKENNING + AUTH_CALLBACK,
    (req: Request, res: Response) => {
      const callbackOptions = {
        redirectUri: authRoutes.AUTH_CALLBACK_EHERKENNING,
      };
      return res.oidc.callback(callbackOptions);
    }
  );

  oidcRouter.get(
    authRoutes.AUTH_LOGIN_EHERKENNING,
    async (req: Request, res: Response) => {
      return res.oidc.login({
        returnTo: getReturnToUrl(req.query),
        authorizationParams: {
          redirect_uri: authRoutes.AUTH_CALLBACK_EHERKENNING,
        },
      });
    }
  );

  oidcRouter.get(
    authRoutes.AUTH_LOGIN_EHERKENNING_LANDING,
    async (req: Request, res: Response) => {
      const auth = getAuth(req);
      if (auth?.profile.id) {
        countLoggedInVisit(auth.profile.id, 'eherkenning');
      }
      return res.redirect(
        process.env.MA_FRONTEND_URL + '?authMethod=eherkenning'
      );
    }
  );
}

// AuthMethod agnostic endpoints
oidcRouter.get(authRoutes.AUTH_CHECK, async (req: Request, res: Response) => {
  const auth = getAuth(req);
  switch (auth?.profile.authMethod) {
    case 'eherkenning':
      return verifyAuthenticated('eherkenning', 'commercial')(req, res);
    case 'digid':
      return verifyAuthenticated('digid', 'private')(req, res);
  }

  return sendUnauthorized(res);
});

oidcRouter.get(
  authRoutes.AUTH_TOKEN_DATA,
  requiresAuth(),
  async (req: Request, res: Response) => {
    if (hasSessionCookie(req)) {
      const auth = getAuth(req);
      if (auth) {
        return res.send(
          apiSuccessResult({
            tokenData: (req as any)[OIDC_SESSION_COOKIE_NAME],
            token: auth.token,
            profile: auth.profile,
          })
        );
      }
    }

    return sendUnauthorized(res);
  }
);

oidcRouter.get(authRoutes.AUTH_LOGOUT, async (req: Request, res: Response) => {
  let redirectUrl = `${process.env.MA_FRONTEND_URL}`;
  let authMethodRequested = req.query.authMethod;

  if (hasSessionCookie(req) && !authMethodRequested) {
    const auth = getAuth(req);
    authMethodRequested = auth?.profile.authMethod;
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

oidcRouter.get(
  authRoutes.AUTH_LOGOUT_DIGID,
  createLogoutHandler(process.env.MA_FRONTEND_URL!)
);

oidcRouter.get(
  authRoutes.AUTH_LOGOUT_EHERKENNING,
  createLogoutHandler(process.env.MA_FRONTEND_URL!)
);

oidcRouter.get(
  authRoutes.AUTH_LOGOUT_EHERKENNING_LOCAL,
  createLogoutHandler(process.env.MA_FRONTEND_URL!, false)
);
