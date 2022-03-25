/* eslint-disable import/first */
import * as Sentry from '@sentry/node';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import express, {
  ErrorRequestHandler,
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';
import morgan from 'morgan';
import { ENV, getOtapEnvItem, IS_AP } from '../universal/config/env';
import { apiErrorResult } from '../universal/helpers';
import { BFF_BASE_PATH, BFF_PORT, corsOptions } from './config';
import { clearSession, send404, sessionID } from './helpers/app';
import { routerDevelopment } from './mock-data/router-development';
import { router as authRouter } from './router-auth';
import { router as protectedRouter } from './router-protected';
import { router as publicRouter } from './router-public';

const isDevelopment = ENV === 'development';
const ENV_FILE = `.env${isDevelopment ? '.local' : '.production'}`;

dotenv.config({ path: ENV_FILE });

const sentryOptions: Sentry.NodeOptions = {
  dsn: getOtapEnvItem('bffSentryDsn'),
  environment: ENV,
  debug: isDevelopment,
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

app.use(publicRouter);
app.use(authRouter);

// Development routing for mock data
if (!IS_AP) {
  app.use(routerDevelopment);
}

// Generate session id
app.use(sessionID);

// Mount the routers at the base path
app.use(BFF_BASE_PATH, protectedRouter);

// Destroy the session as soon as the api requests are all processed
app.use(clearSession);

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
    `Mijn Amsterdam BFF api listening on ${BFF_PORT}... [debug: ${isDevelopment}]`
  );
});

// From https://shuheikagawa.com/blog/2019/04/25/keep-alive-timeout/
server.keepAliveTimeout = 60 * 1000;
server.headersTimeout = 65 * 1000; // This should be bigger than `keepAliveTimeout + your server's expected response time`
