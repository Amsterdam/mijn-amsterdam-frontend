import express, { Request } from 'express';

import compression from 'compression';
import cors from 'cors';
import { router } from './router';
import session from 'express-session';
import { clearCache } from './helpers';

const PORT = process.env.BFF_API_PORT || 5000;

const app = express();

app.use(cors());

app.use(
  session({
    secret: 'xkcd', // from .env variable
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' },
  })
);

app.use(compression(), router);

app.use((req: Request) => {
  const sessionID = req.sessionID!;
  clearCache(sessionID);
});

app.listen(PORT, () => {
  console.log(`Mijn Amsterdam BFF api listening on ${PORT}...`);
});
