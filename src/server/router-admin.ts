import express, { NextFunction, Request, Response } from 'express';
import basicAuth from 'express-basic-auth';
import { cacheOverview } from './helpers/file-cache';
import { BffEndpoints } from './routing/bff-routes';
import { sessionBlacklistTable } from './services/session-blacklist';
import { loginStats, loginStatsTable } from './services/visitors';

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
}
