import express, { NextFunction, Request, Response } from 'express';
import basicAuth from 'express-basic-auth';

import { BffEndpoints } from './bff-routes';
import { DEFAULT_REQUEST_CONFIG } from '../config/source-api';
import { cacheOverview } from '../helpers/file-cache';
import { loginStats, loginStatsTable } from '../services/visitors';

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

  adminRouter.get(
    BffEndpoints.CACHE_OVERVIEW,
    async (req: Request, res: Response, next: NextFunction) => {
      const files = await cacheOverview();
      return res.json({
        sourceApiRequestCacheTimeoutDefault:
          DEFAULT_REQUEST_CONFIG.cacheTimeout,
        files,
      });
    }
  );
}
