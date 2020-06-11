import express from 'express';

import compression from 'compression';
import cors from 'cors';
import { router, eventSourceRouter } from './router';
import session from 'express-session';

const PORT = process.env.BFF_API_PORT || 5000;

const app = express();

app.use(cors());

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
app.use(eventSourceRouter);
app.use(compression(), router);

app.listen(PORT, () => {
  console.log(`Mijn Amsterdam BFF api listening on ${PORT}...`);
});
