import express, { Request, Response, NextFunction } from 'express';

import compression from 'compression';
import cors from 'cors';
import { router } from './router';
import session from 'express-session';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { clearCache } from './helpers';
import { BFF_BASE_PATH } from './config';

const PORT = process.env.BFF_API_PORT || 5000;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(cookieParser());

app.use(
  session({
    secret: 'xkcd', // from .env variable
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.BFF_ENV === 'production' },
  })
);

app.use(compression());
// Mount the router at the base path
app.use(BFF_BASE_PATH, router);

app.use((req: Request, res: Response, next: NextFunction) => {
  const sessionID = req.sessionID!;
  clearCache(sessionID);
  next();
});

app.use((req: Request, res: Response) => {
  res.status(404);
  return res.end('not found');
});

app.listen(PORT, () => {
  console.log(`Mijn Amsterdam BFF api listening on ${PORT}...`);
});
