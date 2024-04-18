/* eslint-disable import/first */
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import {
  IS_AP,
  IS_DEVELOPMENT,
  IS_OT,
  IS_PRODUCTION,
} from '../universal/config/env';

if (IS_DEVELOPMENT) {
  const ENV_FILE = '.env.local';
  console.debug(`trying env file ${ENV_FILE}`);
  const envConfig = dotenv.config({ path: ENV_FILE });
  dotenvExpand.expand(envConfig);
}

import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import morgan from 'morgan';
import { BFF_BASE_PATH, BFF_PORT, BffEndpoints } from './config';
import { clearRequestCache, nocache, requestID, send404 } from './helpers/app';
import { adminRouter } from './router-admin';
import { authRouterDevelopment, relayDevRouter } from './router-development';
import { router as oidcRouter } from './router-oidc';
import { router as protectedRouter } from './router-protected';
import { legacyRouter, router as publicRouter } from './router-public';
import { cleanupSessionBlacklistTable } from './services/cron/jobs';
import { captureException, captureMessage } from './services/monitoring';

const app = express();

app.set('trust proxy', true);

// Security, disable express header.
app.disable('x-powered-by');

const viewDir = __dirname.split('/').slice(-2, -1);

// Set-up view engine voor SSR
app.set('view engine', 'pug');
app.set('views', `./${viewDir}/server/views`);

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

app.use(cookieParser());
app.use(compression());

// Generate request id
app.use(requestID);

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

/**
 * The public router has routes that can be accessed by anyone without any authentication.
 */
app.use(BFF_BASE_PATH, publicRouter);

////////////////////////////////////////////////////////////////////////
///// [DEVELOPMENT - TEST]
///// Development routing for mock data
////////////////////////////////////////////////////////////////////////
if (IS_OT && !IS_AP) {
  app.use(authRouterDevelopment);
}
///// [DEVELOPENT ONLY] /////
if (IS_DEVELOPMENT) {
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

// Optional fallthrough error handler
app.use(function onError(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  captureException(err, {
    properties: {
      message: 'Express onError handler',
    },
  });

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
    captureException(new Error('404 not found'), {
      properties: { url: req.url },
    });
    return send404(res);
  }
  return res.end();
});

const server = app.listen(BFF_PORT, () => {
  console.info(
    `Mijn Amsterdam BFF api listening on ${BFF_PORT}... [debug: ${IS_DEVELOPMENT}]`
  );
});

server.on('error', (error) => {
  captureException(error, {
    properties: {
      message: 'Server onError handler',
    },
  });
});

// From https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/
server.keepAliveTimeout = 60 * 1000;
server.headersTimeout = 65 * 1000; // This should be bigger than `keepAliveTimeout + your server's expected response time`

// Start Cron jobs
cleanupSessionBlacklistTable.start();
