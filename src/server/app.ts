import * as Sentry from '@sentry/node';
import bodyParser from 'body-parser';
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
import session from 'express-session';
import { ENV, getOtapEnvItem, IS_AP } from '../universal/config/env';
import { apiErrorResult } from '../universal/helpers';
import {
  BFF_PORT,
  PUBLIC_BFF_ENDPOINTS,
  BffEndpoints,
  TMA_SAML_HEADER,
} from './config';
import { router } from './router';
import { getPassthroughRequestHeaders, send404 } from './helpers/request';

const options: Sentry.NodeOptions = {
  dsn: getOtapEnvItem('bffSentryDsn'),
  environment: ENV,
  debug: ENV === 'development',
};
Sentry.init(options);

const app = express();
const BASE_PATH = IS_AP ? '/bff' : '/test-api/bff';

app.set('trust proxy', true);
app.use(Sentry.Handlers.requestHandler() as RequestHandler);

app.use(cors());
app.use(bodyParser.json({ limit: '1mb' }));
app.use(cookieParser());

app.use(
  session({
    secret: process.env.BFF_COOKIE_SESSION_SECRET || 'development',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: IS_AP },
    proxy: true,
  })
);

app.use(compression());

// Basic security measure
app.use((req: Request, res: Response, next: NextFunction) => {
  const passthroughRequestHeaders = getPassthroughRequestHeaders(req);
  const isBffEndpoint = Object.values(BffEndpoints).some(
    path => req.path === `${BASE_PATH}${path}`
  );
  const isBffPublicEndpoint = PUBLIC_BFF_ENDPOINTS.some(
    path => req.path === `${BASE_PATH}${path}`
  );
  // Exit early if request is not made to a bff endpoint.
  if (!isBffEndpoint) {
    send404(res);
  }

  // Check if this is a request to a public endpoint
  if (isBffPublicEndpoint) {
    // We don't expect saml token header for this endpoint.
    if (passthroughRequestHeaders[TMA_SAML_HEADER]) {
      next(new Error('Saml token disallowed for public endpoint.'));
    } else {
      next();
    }
  } else {
    // We expect saml token header to be present for non-public endpoint.
    if (passthroughRequestHeaders[TMA_SAML_HEADER]) {
      next();
    } else {
      next(new Error('Saml token required for secure endpoint.'));
    }
  }
});

// Mount the router at the base path
app.use(BASE_PATH, router);

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
  send404(res);
});

app.listen(BFF_PORT, () => {
  console.info(`Mijn Amsterdam BFF api listening on ${BFF_PORT}...`);
});
