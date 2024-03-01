/* eslint-disable import/first */
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import {
  IS_AP,
  IS_AZ,
  IS_DEVELOPMENT,
  IS_OT,
  IS_PRODUCTION,
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

import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import cors from 'cors';
import {
  BFF_BASE_PATH,
  BFF_PORT,
  BffEndpoints,
  RELEASE_VERSION,
  securityHeaders,
} from './config';
import { clearRequestCache, nocache, requestID, send404 } from './helpers/app';
import { adminRouter } from './router-admin';
import { authRouterDevelopment, relayDevRouter } from './router-development';
import { router as oidcRouter } from './router-oidc';
import { router as protectedRouter } from './router-protected';
import { legacyRouter, router as publicRouter } from './router-public';
import { cleanupSessionBlacklistTable } from './services/cron/jobs';

const sentryOptions: Sentry.NodeOptions = {
  dsn: process.env.BFF_SENTRY_DSN,
  environment: `${IS_AZ ? 'az-' : ''}${OTAP_ENV}`,
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
  standardHeaders: false, // Return rate limit info in the `RateLimit-*` headers
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

if (IS_DEVELOPMENT) {
  app.use(
    cors({
      origin: process.env.MA_FRONTEND_URL,
      credentials: true,
    })
  );
}

// Json body parsing
app.use(express.json());

// Error handler
app.use(Sentry.Handlers.requestHandler() as RequestHandler);

app.use(cookieParser());
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
///// Public routes Voor Acceptance - Development
////////////////////////////////////////////////////////////////////////
if (IS_AP && !IS_OT) {
  app.use(oidcRouter);
}

app.use(legacyRouter);

app.use(BFF_BASE_PATH, publicRouter);

////////////////////////////////////////////////////////////////////////
///// [DEVELOPMENT - TEST]
///// Development routing for mock data
////////////////////////////////////////////////////////////////////////
if (IS_OT && !IS_AP) {
  app.use(authRouterDevelopment);
}
///// [DEVELOPENT ONLY] /////
if (IS_OT) {
  app.use(`${BFF_BASE_PATH + BffEndpoints.API_RELAY}`, relayDevRouter);
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
  Sentry.captureException(err);
  if (!IS_PRODUCTION) {
    return res.redirect(
      `${process.env.MA_FRONTEND_URL}/server-error-500?stack=${JSON.stringify(
        err.stack,
        null,
        2
      )}`
    );
  }
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
