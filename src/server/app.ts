import bodyParser from 'body-parser';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import { IS_AP } from '../universal/config/env';
import { BFF_PORT } from './config';
import { clearCache } from './helpers';
import { router } from './router';

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  session({
    secret: 'xkcd', // from .env variable
    resave: false,
    saveUninitialized: true,
    cookie: { secure: IS_AP },
  })
);

app.use(compression());
// Mount the router at the base path
app.use(['/api/bff', '/api-test/bff'], router);

app.use((req: Request, res: Response, next: NextFunction) => {
  const sessionID = req.sessionID!;
  clearCache(sessionID);
  next();
});

app.use((req: Request, res: Response) => {
  res.status(404);
  return res.end('not found');
});

app.listen(BFF_PORT, () => {
  console.log(`Mijn Amsterdam BFF api listening on ${BFF_PORT}...`);
});
