import express, { NextFunction, Request, Response } from 'express';
import basicAuth from 'express-basic-auth';
import { IS_DEVELOPMENT, IS_OT } from '../universal/config';
import { BffEndpoints } from './config';
import { sessionBlacklistTable } from './services/session-blacklist';
import { loginStats, loginStatsTable } from './services/visitors';
import { cacheOverview } from './helpers/file-cache';

export const adminRouter = express.Router();

if (process.env.BFF_LOGIN_COUNT_ADMIN_PW) {
  const auth = basicAuth({
    users: {
      admin: process.env.BFF_LOGIN_COUNT_ADMIN_PW,
    },
    challenge: true,
  });

  adminRouter.use('/admin', auth);

  adminRouter.get(BffEndpoints.LOGIN_RAW, loginStatsTable);
  adminRouter.get(BffEndpoints.LOGIN_STATS, loginStats);
  adminRouter.get(BffEndpoints.SESSION_BLACKLIST_RAW, sessionBlacklistTable);

  adminRouter.get(
    BffEndpoints.CACHE_OVERVIEW,
    async (req: Request, res: Response, next: NextFunction) => {
      const overview = await cacheOverview();
      return res.json(overview);
    }
  );

  if (IS_DEVELOPMENT) {
    // Currently this endpoint can only be used when running the application locally.
    // Requesting the endpoint on Azure results in a Gateway timeout which cannot be prevented easily at this time.
    adminRouter.get(BffEndpoints.TEST_ACCOUNTS_OVERVIEW, async (req, res) => {
      const { generateOverview } = await import(
        './generate-user-data-overview'
      );
      generateOverview(req.query.fromCache == '1', `${__dirname}/cache`).then(
        (fileName) => {
          res.download(fileName);
        }
      );
    });
  }
}
