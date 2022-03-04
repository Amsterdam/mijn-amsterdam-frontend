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
import { auth, ConfigParams, requiresAuth } from 'express-openid-connect';
import morgan from 'morgan';
import { UserTpe } from '../universal/config';
import { ENV, getOtapEnvItem, IS_AP } from '../universal/config/env';
import { apiErrorResult, apiSuccesResult } from '../universal/helpers';
import { BffEndpoints, BFF_PORT } from './config';
import { send404 } from './helpers/app';

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

const oidcConfig: ConfigParams = {
  authRequired: false,
  auth0Logout: false,
  idpLogout: true,
  secret: process.env.BFF_OIDC_SECRET,
  baseURL: process.env.BFF_OIDC_BASE_URL,
  clientID: process.env.BFF_OIDC_CLIENT_ID,
  issuerBaseURL: process.env.BFF_OIDC_ISSUER_BASE_URL,
  routes: {
    logout: false,
    login: false,
    callback: BffEndpoints.PUBLIC_AUTH_CALLBACK,
    // callback: process.env.BFF_OIDC_CALLBACK, // Callback url is relative to baseUrl
    postLogoutRedirect: process.env.BFF_REDIRECT_TO_AFTER_LOGOUT,
  },
};

const app = express();

app.use((req, res, next) => {
  console.log('before:', req.url);
  next();
});

app.use(morgan('combined'));
app.use(express.json());
app.set('trust proxy', true);
app.use(Sentry.Handlers.requestHandler() as RequestHandler);

app.use(cors());
app.use(cookieParser());
app.use(compression());

// Basic security measure
// app.use(exitEarly);

// Enable OIDC
app.use(auth(oidcConfig));

const SESSION_MAX_AGE = 15 * 60 * 1000; // 15 minutes

// Possible refresh token call here?

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

app.get(BffEndpoints.PUBLIC_AUTH_BASE, (req, res) => {
  if (req.oidc.isAuthenticated()) {
    return res.redirect(BffEndpoints.PUBLIC_AUTH_USER);
  } else {
    return res.send(
      `You are logged out. <a href="${BffEndpoints.PUBLIC_AUTH_LOGIN}">login</a>`
    );
  }
});

app.get(BffEndpoints.PUBLIC_AUTH_LOGIN, (req, res) => {
  return res.oidc.login({
    returnTo: BffEndpoints.PUBLIC_AUTH_USER,
  });
});

app.get(BffEndpoints.PUBLIC_AUTH_LOGOUT, (req, res) => {
  return res.oidc.logout({
    returnTo: BffEndpoints.PUBLIC_AUTH_BASE,
  });
});

app.get(BffEndpoints.PUBLIC_AUTH_USER, requiresAuth(), (req, res) => {
  return res.send(req.oidc.user);
});

app.get(BffEndpoints.PUBLIC_AUTH_CHECK, (req, res) => {
  if (req.oidc.isAuthenticated()) {
    // TODO: Extract validity from token
    const now = new Date().getTime();
    const validUntil = new Date(now + SESSION_MAX_AGE).getTime();

    res.send(
      apiSuccesResult({
        isAuthenticated: true,
        userType: UserTpe.BURGER, // TODO: get from req.oidc.user.type ???
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
