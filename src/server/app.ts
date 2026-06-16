/* Disable import order here, because this order matters with how we build our environment variables. */
/* eslint-disable import/order */

/* tslint:disable:no-implicit-dependencies */
/* tslint:disable:no-submodule-imports */

// Keep the loading of environment variables at the top.
import './helpers/load-env.ts';
import { IS_DEVELOPMENT, IS_PRODUCTION } from '../universal/config/env.ts';

// Note: Keep this line after loading in env files or LOG_LEVEL will be undefined.
import { logger } from './logging.ts';

const debug = process.env.DEBUG;

const debugResponseDataTerms = process.env.DEBUG_RESPONSE_DATA;
if (debugResponseDataTerms && !debug?.includes('source-api-request:response')) {
  logger.info(
    `Enabling debug for source-api-request:response because DEBUG_RESPONSE_DATA is set (${debugResponseDataTerms})`
  );
  process.env.DEBUG = `source-api-request:response,${process.env.DEBUG ?? ''}`;
}

const debugRequestDataTerms = process.env.DEBUG_REQUEST_DATA;
if (debugRequestDataTerms && !debug?.includes('source-api-request:request')) {
  logger.info(
    `Enabling debug for source-api-request:request because DEBUG_REQUEST_DATA is set (${debugRequestDataTerms})`
  );
  process.env.DEBUG = `source-api-request:request,${process.env.DEBUG ?? ''}`;
}

// DO NOT IMPORT './debug' before modifying process.env.debug. The debug package used will read process.env.debug only once on import.
import './debug.ts';

import path from 'node:path';
import { HttpStatusCode } from 'axios';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import type { NextFunction, Request, Response } from 'express';
import express from 'express';

import {
  BFF_PORT,
  MA_FRONTEND_URL,
  ONE_MINUTE_SECONDS,
  ONE_SECOND_MS,
} from './config/app.ts';
import { requestID } from './routing/route-handlers.ts';
import { generateMaFrontendUrl, send404 } from './routing/route-helpers.ts';
import { captureException } from './services/monitoring.ts';
import { getFromEnv } from './helpers/env.ts';
import { getDirname } from './helpers/dir.ts';
import { router as appMainRouter } from './routing/app-router-main.ts';

const app = express();

app.set('trust proxy', true);

// Security, disable express header.
app.disable('x-powered-by');

const viewDir = getDirname(import.meta.url)
  .split(path.sep)
  .slice(-2, -1);

// Set-up view engine voor SSR
app.set('view engine', 'pug');
app.set('views', path.join(...viewDir, 'server', 'views'));

app.use(
  cors({
    origin: MA_FRONTEND_URL,
    credentials: true,
  })
);
// Json body parsing
app.use(express.json());

app.use(cookieParser());
app.use(compression());

// Generate request id
app.use(requestID);

app.use(appMainRouter);

app.use((_req: Request, res: Response) => {
  if (!res.headersSent) {
    return send404(res);
  }
  return res.end();
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

  const redirectUrl = generateMaFrontendUrl('/server-error-500');

  if (!IS_PRODUCTION) {
    return res.redirect(
      `${redirectUrl}?stack=${JSON.stringify(err.stack, null, 2)}`
    );
  }
  return res.redirect(`${redirectUrl}`);
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
    // This logs all data. Doing this in production would be a huge privacy risk
    if (!IS_PRODUCTION) {
      await import('log-that-http');
    }
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

const scriptName = path.parse(process.argv.at(1) ?? '').name;

if (import.meta.main || scriptName === 'app-start' || process.versions.bun) {
  startServerBFF();
}

export const forTesting = {
  app,
};
