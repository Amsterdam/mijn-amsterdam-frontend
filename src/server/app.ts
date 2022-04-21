/* eslint-disable import/first */
import dotenv from 'dotenv';
import { ENV, getOtapEnvItem, IS_AP } from '../universal/config/env';

const isDevelopment = ENV === 'development';
const ENV_FILE = `.env${isDevelopment ? '.local' : '.production'}`;

dotenv.config({ path: ENV_FILE });

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

import morgan from 'morgan';

import { apiErrorResult } from '../universal/helpers';
import { BFF_BASE_PATH, BFF_PORT, corsOptions } from './config';
import { clearRequestCache, send404, requestID } from './helpers/app';
import { authRouterDevelopment } from './router-development';
import { router as authRouter } from './router-auth';
import { router as protectedRouter } from './router-protected';
import { router as publicRouter } from './router-public';

const sentryOptions: Sentry.NodeOptions = {
  dsn: getOtapEnvItem('bffSentryDsn'),
  environment: ENV,
  debug: isDevelopment,
  autoSessionTracking: false,
  beforeSend(event, hint) {
    if (isDevelopment) {
      console.log(hint);
      return null;
    }
    return event;
  },
  release: `mijnamsterdam-bff@${process.env.npm_package_version}`,
};

Sentry.init(sentryOptions);

const app = express();

// Logging
app.use(morgan('combined'));

// Json body parsing
app.use(express.json());
app.set('trust proxy', true);

// Error handler
app.use(Sentry.Handlers.requestHandler() as RequestHandler);

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(compression());

// Generate request id
app.use(requestID);

// Public routes
app.use(authRouter);
app.use(BFF_BASE_PATH, publicRouter);

// Development routing for mock data
if (!IS_AP) {
  app.use(authRouterDevelopment);
}

// Mount the routers at the base path
// app.use(BFF_BASE_PATH, protectedRouter);

// Destroy the session as soon as the api requests are all processed
app.use(clearRequestCache);

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
  return res.status(500).json(responseData);
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
    `Mijn Amsterdam BFF api listening on ${BFF_PORT}... [debug: ${isDevelopment}]`
  );
});

// From https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/
server.keepAliveTimeout = 60 * 1000;
server.headersTimeout = 65 * 1000; // This should be bigger than `keepAliveTimeout + your server's expected response time`
