import * as Sentry from '@sentry/node';
import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, {
  NextFunction,
  Request,
  Response,
  RequestHandler,
  ErrorRequestHandler,
} from 'express';
import session from 'express-session';
import { IS_AP, getOtapEnvItem, ENV } from '../universal/config/env';
import { BFF_PORT } from './config';
import { clearCache } from './helpers';
import { router } from './router';
import { apiErrorResult } from '../universal/helpers';

if (getOtapEnvItem('bffSentryDsn')) {
  Sentry.init({
    dsn: getOtapEnvItem('bffSentryDsn'),
    environment: ENV,
  });
}

const app = express();

if (IS_AP) {
  app.set('trust proxy', 1);
}

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
  })
);

app.use(compression());
// Mount the router at the base path
app.use(IS_AP ? '/bff' : '/test-api/bff', router);

app.use(Sentry.Handlers.errorHandler() as ErrorRequestHandler);

app.use((req: Request, res: Response, next: NextFunction) => {
  const sessionID = req.sessionID!;
  clearCache(sessionID);
  next();
});

// Optional fallthrough error handler
app.use(function onError(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // @ts-ignore
  const responseData = apiErrorResult(err, null, res.sentry);
  res.status(500).json(responseData);
});

app.use((req: Request, res: Response) => {
  res.status(404);
  return res.end('not found');
});

app.listen(BFF_PORT, () => {
  console.log(`Mijn Amsterdam BFF api listening on ${BFF_PORT}...`);
});
