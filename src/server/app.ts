/* eslint-disable import/first */
import dotenv from 'dotenv';
const ENV_LOCAL = '.env.local';
dotenv.config({ path: ENV_LOCAL });

import * as Sentry from '@sentry/node';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import { auth, ConfigParams } from 'express-openid-connect';
import morgan from 'morgan';
import { UserType } from '../universal/config';
import { ENV, getOtapEnvItem, IS_AP } from '../universal/config/env';
import { apiErrorResult, apiSuccessResult } from '../universal/helpers';
import {
  BffEndpoints,
  BFF_PORT,
  PUBLIC_AUTH_CALLBACK,
  PUBLIC_AUTH_LOGOUT,
} from './config';
import { getTokenData, send404 } from './helpers/app';

const isDebug = ENV === 'development';
const sentryOptions: Sentry.NodeOptions = {
  dsn: getOtapEnvItem('bffSentryDsn'),
  environment: ENV,
  debug: isDebug,
  beforeSend(event, hint) {
    if (isDebug) {
      console.log(hint);
      return null;
    }
    return event;
  },
  release: `mijnamsterdam-bff@${process.env.npm_package_version}`,
};

Sentry.init(sentryOptions);

const app = express();

app.use(morgan('combined'));
app.use(express.json());
app.set('trust proxy', true);
app.use(Sentry.Handlers.requestHandler() as RequestHandler);

app.use(cors());
app.use(cookieParser());
app.use(compression());

// Basic security measure
// app.use(exitEarly);

const oidcConfigBase: ConfigParams = {
  authRequired: false,
  auth0Logout: false,
  idpLogout: true,
  secret: process.env.BFF_OIDC_SECRET,
  baseURL: process.env.BFF_OIDC_BASE_URL,
  issuerBaseURL: process.env.BFF_OIDC_ISSUER_BASE_URL,
  attemptSilentLogin: false,
  authorizationParams: { prompt: 'login' },
};

const oidcConfigDigid: ConfigParams = {
  ...oidcConfigBase,
  clientID: process.env.BFF_OIDC_CLIENT_ID_DIGID,
  routes: {
    login: false,
    logout: PUBLIC_AUTH_LOGOUT,
    callback: PUBLIC_AUTH_CALLBACK, // Relative to the Router path PUBLIC_AUTH_BASE_DIGID
    postLogoutRedirect: process.env.BFF_REDIRECT_TO_AFTER_LOGOUT,
  },
};

const oidcConfigEherkenning: ConfigParams = {
  ...oidcConfigBase,
  clientID: process.env.BFF_OIDC_CLIENT_ID_EHERKENNING,
  routes: {
    login: false,
    logout: PUBLIC_AUTH_LOGOUT,
    callback: PUBLIC_AUTH_CALLBACK, // Relative to the Router path PUBLIC_AUTH_BASE_EHERKENNING
    postLogoutRedirect: process.env.BFF_REDIRECT_TO_AFTER_LOGOUT,
  },
};

// Enable OIDC
app.use(BffEndpoints.PUBLIC_AUTH_BASE_DIGID, auth(oidcConfigDigid));
app.use(BffEndpoints.PUBLIC_AUTH_BASE_EHERKENNING, auth(oidcConfigEherkenning));

const SESSION_MAX_AGE = 15 * 60 * 1000; // 15 minutes

app.get('/', (req, res) => {
  return res.send('waaah');
});

app.get(
  BffEndpoints.PUBLIC_HEALTH,
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ status: 'OK' });
    next();
  }
);

app.get(BffEndpoints.PUBLIC_AUTH_LOGIN_DIGID, (req, res) => {
  return res.oidc.login({
    returnTo: BffEndpoints.PUBLIC_AUTH_USER,
    authorizationParams: {
      // Specify full url here, the default redirect url is constructed of base_url and routes.callback which doesn't take the router base path into account whilst the auth() middleware does.
      redirect_uri: BffEndpoints.PUBLIC_AUTH_CALLBACK_DIGID,
    },
  });
});

app.get(BffEndpoints.PUBLIC_AUTH_LOGIN_EHERKENNING, (req, res) => {
  return res.oidc.login({
    returnTo: BffEndpoints.PUBLIC_AUTH_USER,
    authorizationParams: {
      // Specify full url here, the default redirect url is constructed of base_url and routes.callback which doesn't take the router base path into account whilst the auth() middleware does.
      redirect_uri: BffEndpoints.PUBLIC_AUTH_CALLBACK_EHERKENNING,
    },
  });
});

// app.get(BffEndpoints.PUBLIC_AUTH_LOGOUT, (req, res) => {
//   return res.oidc.logout({
//     returnTo: BffEndpoints.PUBLIC_AUTH_BASE,
//   });
// });

app.get(BffEndpoints.PUBLIC_AUTH_USER, (req, res) => {
  try {
    const tokenData = getTokenData(req.cookies.appSession);
    let authMethod = '';
    let profileType = '';

    switch (tokenData.aud) {
      case oidcConfigDigid.clientID:
        authMethod = 'digid';
        profileType = 'private';
        break;
      case oidcConfigEherkenning.clientID:
        authMethod = 'eherkenning';
        profileType = 'commercial';
        break;
    }

    return res.send(
      apiSuccessResult({
        authMethod,
        profileType,
      })
    );
  } catch (error) {
    res.status(401);
    return res.send(apiErrorResult('Not authorized', null));
  }
});

app.get(BffEndpoints.PUBLIC_AUTH_CHECK, (req, res) => {
  if (req.oidc.isAuthenticated()) {
    // TODO: Extract validity from token
    const now = new Date().getTime();
    const validUntil = new Date(now + SESSION_MAX_AGE).getTime();

    res.send(
      apiSuccessResult({
        isAuthenticated: true,
        userType: UserType.BURGER, // TODO: get from req.oidc.user.type ???
        validUntil,
      })
    );
  } else {
    res.status(401).send(apiErrorResult('Not authenticated.', false));
  }
});

// Development routing for mock data
if (!IS_AP) {
  // app.use(routerDevelopment);
}

// Generate session id
// app.use(sessionID);

// Mount the routers at the base path
// app.use(BFF_BASE_PATH, router);

// Destroy the session as soon as the api requests are all processed
// app.use(clearSession);

app.use(Sentry.Handlers.errorHandler() as ErrorRequestHandler);

// Optional fallthrough error handler
app.use(function onError(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // @ts-ignore
  const responseData = apiErrorResult(err.toString(), null, res.sentry);
  res.status(500).json(responseData);
});

app.use((req: Request, res: Response) => {
  if (!res.headersSent) {
    Sentry.captureMessage('404 not found', { extra: { url: req.url } });
    send404(res);
  } else {
    res.end();
  }
});

const server = app.listen(BFF_PORT, () => {
  console.info(
    `Mijn Amsterdam BFF api listening on ${BFF_PORT}... [debug: ${isDebug}]`
  );
});

// From https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/
server.keepAliveTimeout = 60 * 1000;
server.headersTimeout = 65 * 1000; // This should be bigger than `keepAliveTimeout + your server's expected response time`
