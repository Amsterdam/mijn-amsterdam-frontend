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
import { BFF_PORT } from './config';
import { router } from './router';

const options: Sentry.NodeOptions = {
  dsn: getOtapEnvItem('bffSentryDsn'),
  environment: ENV,
  debug: ENV === 'development',
};
Sentry.init(options);

const app = express();

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
// Mount the router at the base path
app.use(IS_AP ? '/bff' : '/test-api/bff', router);

app.use(Sentry.Handlers.errorHandler() as ErrorRequestHandler);

// Force Clear the cache after all the services requests are done.
// app.use((req: Request, res: Response, next: NextFunction) => {
//   const sessionID = req.sessionID!;
//   clearSessionCache(sessionID);
//   next();
// });

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
  res.status(404);
  return res.end('not found');
});

app.listen(BFF_PORT, () => {
  console.info(`Mijn Amsterdam BFF api listening on ${BFF_PORT}...`);
});
