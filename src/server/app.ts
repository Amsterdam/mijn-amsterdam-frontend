import { API_BASE_PATH } from '../universal/config';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import { router } from './router';
import session from 'express-session';

const PORT = process.env.BFF_API_PORT || 5001;

const app = express();

app.use(cors());
app.use(compression());

app.use(
  session({
    secret: 'xkcd', // from .env variable
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' },
    // genid: function(req) {
    //   return req.cookies.aselectticket;
    // }
  })
);

app.use(API_BASE_PATH, router);

app.listen(PORT, () => {
  console.log('Mijn Amsterdam BFF api listening...');
});
