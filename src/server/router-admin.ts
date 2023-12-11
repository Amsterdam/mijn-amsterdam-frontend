import express from 'express';
import basicAuth from 'express-basic-auth';
import { BffEndpoints } from './config';
import { generateOverview } from './generate-user-data-overview';
import { loginStats, loginStatsTable } from './services/visitors';
import { sessionBlacklistTable } from './services/session-blacklist';

export const adminRouter = express.Router();

if (process.env.BFF_LOGIN_COUNT_ADMIN_PW) {
  const auth = basicAuth({
    users: {
      admin: process.env.BFF_LOGIN_COUNT_ADMIN_PW,
    },
    challenge: true,
  });

  adminRouter.use(auth);

  adminRouter.get(BffEndpoints.LOGIN_RAW, loginStatsTable);
  adminRouter.get(BffEndpoints.LOGIN_STATS, loginStats);
  adminRouter.get(BffEndpoints.SESSION_BLACKLIST_RAW, sessionBlacklistTable);

  // Currently this endpoint can only be used when running the application locally.
  // Requesting the endpoint on Azure results in a Gateway timeout which cannot be prevented easily at this time.
  adminRouter.get(BffEndpoints.TEST_ACCOUNTS_OVERVIEW, async (req, res) => {
    generateOverview(req.query.fromCache == '1', `${__dirname}/cache`).then(
      (fileName) => {
        res.download(fileName);
      }
    );
  });
}
