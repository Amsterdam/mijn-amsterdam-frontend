/* eslint-disable import/first */
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';

import { ENV, IS_AP } from '../universal/config/env';
const isDevelopment = ENV === 'development';
const ENV_FILE = `.env${isDevelopment ? '.local' : '.production'}`;

const envConfig = dotenv.config({ path: ENV_FILE });
dotenvExpand.expand(envConfig);

console.log('using env', ENV_FILE);

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

import { apiErrorResult } from '../universal/helpers';
import { BFF_BASE_PATH, BFF_PORT, BffEndpoints, corsOptions } from './config';
import { clearRequestCache, nocache, requestID, send404 } from './helpers/app';
import { router as authRouter } from './router-auth';
import { authRouterDevelopment, relayDevRouter } from './router-development';
import { router as protectedRouter } from './router-protected';
import { router as publicRouter } from './router-public';

const sentryOptions: Sentry.NodeOptions = {
  dsn: process.env.BFF_SENTRY_DSN,
  environment: ENV,
  debug: isDevelopment,
  autoSessionTracking: false,
  beforeSend(event, hint) {
    if (!process.env.BFF_SENTRY_DSN && isDevelopment) {
      console.log(hint);
    }
    if (!process.env.BFF_SENTRY_DSN) {
      return null;
    }
    return event;
  },
  release: `mijnamsterdam-bff@${process.env.npm_package_version}`,
};

Sentry.init(sentryOptions);

const app = express();
const viewDir = __dirname.split('/').slice(-2, -1);

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

// Destroy the session as soon as the api requests are all processed
app.use(function (req, res, next) {
  res.on('finish', function () {
    clearRequestCache(req, res);
    console.log('the response has been sent');
  });
  next();
});

app.get(
  BffEndpoints.STATUS_HEALTH,
  (req: Request, res: Response, next: NextFunction) => {
    return res.json({ status: 'OK' });
  }
);

// Public routes
app.use(authRouter);
app.use(BFF_BASE_PATH, publicRouter);

// Development routing for mock data
if (!IS_AP) {
  app.use(authRouterDevelopment);
  app.use(relayDevRouter);
}

// Mount the routers at the base path
app.use(BFF_BASE_PATH, nocache, protectedRouter);

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
