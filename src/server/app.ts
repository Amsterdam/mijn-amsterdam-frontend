/* Disable import order here, because this order matters with how we build our environment variables. */
/* eslint-disable import/order */

/* tslint:disable:no-implicit-dependencies */
/* tslint:disable:no-submodule-imports */
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
  // This runs local only and -
  // we can't load the logger before we loader our environment variables.
  // eslint-disable-next-line no-console
  console.debug(`Using local env file ${ENV_FILE}`);
  const envConfig = dotenv.config({ path: ENV_FILE });
  dotenvExpand.expand(envConfig);
}

// Note: Keep this line after loading in env files or LOG_LEVEL will be undefined.
import { logger } from './logging';

const debugResponseDataTerms = process.env.DEBUG_RESPONSE_DATA;
const debug = process.env.DEBUG;

if (debugResponseDataTerms && !debug?.includes('source-api-request:response')) {
  logger.info(
    `Enabling debug for source-api-request:response because DEBUG_RESPONSE_DATA is set (${debugResponseDataTerms})`
  );
  process.env.DEBUG = `source-api-request:response,${process.env.DEBUG ?? ''}`;
}

import { HttpStatusCode } from 'axios';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';

import { BFF_PORT, ONE_MINUTE_SECONDS, ONE_SECOND_MS } from './config/app';
import {
  BFF_BASE_PATH,
  BFF_BASE_PATH_PRIVATE,
  BffEndpoints,
} from './routing/bff-routes';
import {
  handleCheckProtectedRoute,
  handleIsAuthenticated,
  nocache,
  requestID,
} from './routing/route-handlers';
import { generateFullApiUrlBFF, send404 } from './routing/route-helpers';
import { adminRouter } from './routing/router-admin';
import { authRouterDevelopment } from './routing/router-development';
import { oidcRouter } from './routing/router-oidc';
import { router as protectedRouter } from './routing/router-protected';
import { legacyRouter, router as publicRouter } from './routing/router-public';
import { stadspasExternalConsumerRouter } from './services/hli/router-stadspas-external-consumer';
import { captureException } from './services/monitoring';

import { getFromEnv } from './helpers/env';
import { notificationsExternalConsumerRouter } from './routing/router-notifications-external-consumer';
import { router as privateNetworkRouter } from './routing/router-private';

const app = express();

app.set('trust proxy', true);

// Security, disable express header.
app.disable('x-powered-by');

// eslint-disable-next-line no-magic-numbers
const viewDir = __dirname.split('/').slice(-2, -1);

// Set-up view engine voor SSR
app.set('view engine', 'pug');
app.set('views', `./${viewDir}/server/views`);

app.use(
  cors({
    origin: getFromEnv('MA_FRONTEND_URL'),
    credentials: true,
  })
);
// Json body parsing
app.use(express.json());

app.use(cookieParser());
app.use(compression());

// Generate request id
app.use(requestID);

// Some legacy routes that are not prefixed with /api/v1
app.use(legacyRouter);

////////////////////////////////////////////////////////////////////////
///// The public router has routes that can be accessed by anyone without any authentication.
////////////////////////////////////////////////////////////////////////

app.use(BFF_BASE_PATH, publicRouter);

///// [DEVELOPMENT - TEST]
//// In development we use the authRouterDevelopment which has a mock login.
if (IS_OT && !IS_AP) {
  logger.info('Using AUTH Development Router');
  app.use(BFF_BASE_PATH, authRouterDevelopment);
}
///// [PRODUCTION - ACCEPTANCE]
//// In production we use the oidcRouter which has real OIDC login.
if (IS_AP && !IS_OT) {
  logger.info('Using AUTH OIDC Router');
  app.use(BFF_BASE_PATH, oidcRouter);
}

app.use(
  BFF_BASE_PATH,
  nocache,
  stadspasExternalConsumerRouter.public,
  notificationsExternalConsumerRouter.public
);

app.use(
  BFF_BASE_PATH,
  nocache,
  handleCheckProtectedRoute,
  handleIsAuthenticated,
  protectedRouter,
  adminRouter
);

/////////////////////////////////////////////////////////////////////////
///// These routes are not protected by TMA/OIDC system, but
///// are protected by other means (e.g. IP whitelisting, API keys, etc).
///// These routers are all prefixed with /private and not accessible
///// from the public internet.
////////////////////////////////////////////////////////////////////////
app.use(BFF_BASE_PATH_PRIVATE, nocache, privateNetworkRouter);

// Redirects to /api/v1
app.get(BffEndpoints.ROOT, (_req, res) => {
  return res.redirect(generateFullApiUrlBFF(BffEndpoints.ROOT));
});

// Optional fallthrough error handler
app.use(function onError(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  captureException(err, {
    properties: {
      message: 'Express onError handler',
    },
  });

  const redirectUrl = `${process.env.MA_FRONTEND_URL}/server-error-500`;

  if (!IS_PRODUCTION) {
    return res.redirect(
      `${redirectUrl}?stack=${JSON.stringify(err.stack, null, 2)}`
    );
  }
  return res.redirect(`${redirectUrl}`);
});

app.use((_req: Request, res: Response) => {
  if (!res.headersSent) {
    return send404(res);
  }
  return res.end();
});

// Logs all Incoming requests
// Keep this as the LAST app.use(). Else we don't know the resulting statusCode.
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(
    `${req.method} ${req.originalUrl} - Responds with ${res.statusCode} ${HttpStatusCode[res.statusCode]}`
  );
  next();
});

async function startServerBFF() {
  if (
    getFromEnv('LOG_THAT_HTTP') === 'true' ||
    getFromEnv('LOG_THAT_HTTP_HEADERS') === 'true' ||
    getFromEnv('LOG_THAT_HTTP_BODY') === 'true'
  ) {
    await import('log-that-http');
  }
  const server = app.listen(BFF_PORT, () => {
    logger.info(
      `Mijn Amsterdam BFF api listening on ${BFF_PORT}... [IS_DEVELOPMENT: ${IS_DEVELOPMENT}]`
    );
  });

  server.on('error', (error) => {
    captureException(error, {
      properties: {
        message: 'Server onError handler',
      },
    });
  });

  const HEADER_TIMEOUT_SECONDS = 65;
  // From https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/
  server.keepAliveTimeout = ONE_MINUTE_SECONDS;
  server.headersTimeout = HEADER_TIMEOUT_SECONDS * ONE_SECOND_MS; // This should be bigger than `keepAliveTimeout + your server's expected response time`
}
if (
  require.main?.filename.endsWith('bffserver.ts') ||
  require.main?.filename.endsWith('app.js') ||
  process.versions.bun
) {
  startServerBFF();
}

export const forTesting = {
  app,
};
