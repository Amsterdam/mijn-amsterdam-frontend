/* eslint-disable import/first */
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import {
  IS_AP,
  IS_DEVELOPMENT,
  IS_OT,
  OTAP_ENV,
} from '../universal/config/env';

if (IS_DEVELOPMENT) {
  const ENV_FILE = '.env.local';
  console.debug(`trying env file ${ENV_FILE}`);
  const envConfig = dotenv.config({ path: ENV_FILE });
  dotenvExpand.expand(envConfig);
}

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
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';

import {
  BFF_BASE_PATH,
  BFF_PORT,
  corsOptions,
  securityHeaders,
  RELEASE_VERSION,
  BffEndpoints,
} from './config';
import { clearRequestCache, nocache, requestID, send404 } from './helpers/app';
import { authRouterDevelopment, relayDevRouter } from './router-development';
import { router as oidcRouter } from './router-oidc';
import { router as protectedRouter } from './router-protected';
import { router as publicRouter } from './router-public';
import { adminRouter } from './router-admin';
import { cleanupSessionBlacklistTable } from './services/cron/jobs';

const sentryOptions: Sentry.NodeOptions = {
  dsn: process.env.BFF_SENTRY_DSN,
  environment: OTAP_ENV,
  debug: IS_DEVELOPMENT,
  autoSessionTracking: false,
  beforeSend(event, hint) {
    if (IS_DEVELOPMENT) {
      console.log(hint);
      return null;
    }
    return event;
  },
  release: RELEASE_VERSION,
};

Sentry.init(sentryOptions);

const app = express();

app.set('trust proxy', true);

// Security, disable express header.
app.disable('x-powered-by');

const viewDir = __dirname.split('/').slice(-2, -1);

// Set-up view engine voor SSR
app.set('view engine', 'pug');
app.set('views', `./${viewDir}/server/views`);

// set up rate limiter: maximum of five requests per minute
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// apply rate limiter to all requests
app.use(limiter);

// Request logging
morgan.token('build', function (req, res) {
  return `bff-${process.env.MA_BUILD_ID ?? 'latest'}`;
});

app.use(
  morgan(
    '[:build] - :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'
  )
);

// Json body parsing
app.use(express.json());

// Error handler
app.use(Sentry.Handlers.requestHandler() as RequestHandler);

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(compression());

// Generate request id
app.use(requestID);

app.use((req, res, next) => {
  res.set(securityHeaders);
  next();
});

// Destroy the session as soon as the api requests are all processed
app.use(function (req, res, next) {
  res.on('finish', function () {
    clearRequestCache(req, res);
    console.log('the response has been sent');
  });
  next();
});

////////////////////////////////////////////////////////////////////////
///// [ACCEPTANCE - PRODUCTION]
///// Public routes Voor Test - Acceptance - Development
////////////////////////////////////////////////////////////////////////
if (IS_AP && !IS_OT) {
  app.use(oidcRouter);
}

app.use(BFF_BASE_PATH, publicRouter);

// Legacy health check. TODO: Remove after migration to az is complete.
app.get(BffEndpoints.STATUS_HEALTH2, (_req, res) => {
  return res.redirect(`/api/v1${BffEndpoints.STATUS_HEALTH}`);
});

////////////////////////////////////////////////////////////////////////
///// [DEVELOPMENT - TEST]
///// Development routing for mock data
////////////////////////////////////////////////////////////////////////
if (IS_OT && !IS_AP) {
  app.use(authRouterDevelopment);
  app.use(relayDevRouter);
}

////////////////////////////////////////////////////////////////////////
///// Generic Router Method for All environments
////////////////////////////////////////////////////////////////////////
// Mount the routers at the base path
app.use(BFF_BASE_PATH, nocache, protectedRouter, adminRouter);

app.get(BffEndpoints.ROOT, (req, res) => {
  return res.redirect(`${BFF_BASE_PATH + BffEndpoints.ROOT}`);
});

app.use(Sentry.Handlers.errorHandler() as ErrorRequestHandler);

// Optional fallthrough error handler
app.use(function onError(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  return res.redirect(`${process.env.MA_FRONTEND_URL}/server-error-500`);
});

app.use((req: Request, res: Response) => {
  if (!res.headersSent) {
    Sentry.captureMessage('404 not found', { extra: { url: req.url } });
    return send404(res);
  }
  return res.end();
});

const server = app.listen(BFF_PORT, () => {
  console.info(
    `Mijn Amsterdam BFF api listening on ${BFF_PORT}... [debug: ${IS_DEVELOPMENT}]`
  );
});

// From https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/
server.keepAliveTimeout = 60 * 1000;
server.headersTimeout = 65 * 1000; // This should be bigger than `keepAliveTimeout + your server's expected response time`

// Start Cron jobs
cleanupSessionBlacklistTable.start();
