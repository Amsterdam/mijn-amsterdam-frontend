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
app.use(function onError(err, req: Request, res: Response) {
  // if (getOtapEnvItem('sentryDsn')) {
  //   if (error instanceof Error) {
  //     Sentry.captureException(error);
  //   } else {
  //     Sentry.captureMessage(error?.message || 'Unknown errormessage');
  //   }
  // }

  // const responseData = apiErrorResult(err, null);

  // if (isGetRequest) {
  //   // Resolve with error
  //   cache.get(cacheKey).resolve(responseData);
  //   // Don't cache the errors
  //   cache.del(cacheKey);
  // }

  // return responseData;
  // The error id is attached to `res.sentry` to be returned
  // and optionally displayed to the user for support.
  res.statusCode = 500;
  // @ts-ignore
  res.end(res.sentry + '\n');
});

app.use((req: Request, res: Response) => {
  res.status(404);
  return res.end('not found');
});

app.listen(BFF_PORT, () => {
  console.log(`Mijn Amsterdam BFF api listening on ${BFF_PORT}...`);
});
