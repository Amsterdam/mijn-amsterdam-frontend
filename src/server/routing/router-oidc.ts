import express, { Request, RequestHandler, Response } from 'express';
import { ConfigParams, requiresAuth } from 'express-openid-connect';
import { NextFunction } from 'express-serve-static-core';

import { nocache, verifyAuthenticated } from './route-handlers';
import { sendUnauthorized } from './route-helpers';
import { apiSuccessResult } from '../../universal/helpers/api';
import {
  OIDC_SESSION_COOKIE_NAME,
  oidcConfigDigid,
  oidcConfigEherkenning,
  openIdAuth,
  RETURNTO_MAMS_LANDING_DIGID,
  RETURNTO_MAMS_LANDING_EHERKENNING,
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
import { AuthenticatedRequest } from '../auth/auth-types';
import { getFromEnv } from '../helpers/env';
import { countLoggedInVisit } from '../services/visitors';

export const oidcRouter = express.Router();

oidcRouter.BFF_ID = 'router-oidc';

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

function authConfigHandler(req: Request, res: Response, next: NextFunction) {
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
}

// Determine which OIDC config should be used.
oidcRouter.use(authConfigHandler);

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
      returnTo: getReturnToUrl({
        returnTo: RETURNTO_MAMS_LANDING_DIGID,
        ...req.query,
      }),
      authorizationParams: {
        redirect_uri: authRoutes.AUTH_CALLBACK_DIGID,
      },
    });
  }
);

oidcRouter.get(
  authRoutes.AUTH_LOGIN_DIGID_LANDING,
  async (req: Request, res: Response) => {
    const auth = getAuth(req);
    if (auth?.profile.id) {
      countLoggedInVisit(auth.profile.id);
    }
    return res.redirect(process.env.MA_FRONTEND_URL + '?authMethod=digid');
  }
);

/**
 * EHerkenning Oidc config
 */

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
      returnTo: getReturnToUrl({
        returnTo: RETURNTO_MAMS_LANDING_EHERKENNING,
        ...req.query,
      }),
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

async function authCheckHandler(req: Request, res: Response) {
  const auth = getAuth(req);
  switch (auth?.profile.authMethod) {
    case 'eherkenning':
      return verifyAuthenticated('eherkenning', 'commercial')(req, res);
    case 'digid':
      return verifyAuthenticated('digid', 'private')(req, res);
  }

  return sendUnauthorized(res);
}

// AuthMethod agnostic endpoints
oidcRouter.get(authRoutes.AUTH_CHECK, authCheckHandler);

oidcRouter.get(
  authRoutes.AUTH_TOKEN_DATA,
  requiresAuth(),
  async (req: AuthenticatedRequest, res: Response) => {
    if (hasSessionCookie(req)) {
      const auth = getAuth(req);
      if (auth) {
        return res.send(
          apiSuccessResult({
            tokenData: req[OIDC_SESSION_COOKIE_NAME],
            token: auth.token,
            profile: auth.profile,
          })
        );
      }
    }

    return sendUnauthorized(res);
  }
);

async function authLogoutHandler(req: Request, res: Response) {
  let redirectUrl = getFromEnv('MA_FRONTEND_URL', true) as string;
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
}

oidcRouter.get(authRoutes.AUTH_LOGOUT, authLogoutHandler);

oidcRouter.get(
  authRoutes.AUTH_LOGOUT_DIGID,
  createLogoutHandler(getFromEnv('MA_FRONTEND_URL', true) as string)
);

oidcRouter.get(
  authRoutes.AUTH_LOGOUT_EHERKENNING,
  createLogoutHandler(getFromEnv('MA_FRONTEND_URL', true) as string)
);

const DO_IDP_LOGOUT = false;
// Only destroys the BFF Application session, no logout of TMA in our case.
oidcRouter.get(
  authRoutes.AUTH_LOGOUT_EHERKENNING_LOCAL,
  createLogoutHandler(
    getFromEnv('MA_FRONTEND_URL', true) as string,
    DO_IDP_LOGOUT
  )
);

export const forTesting = {
  authCheckHandler,
  authConfigHandler,
  authInstances,
  authLogoutHandler,
  getOidcConfigByRequest,
};
