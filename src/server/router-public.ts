import express, { NextFunction, Request, Response } from 'express';
import { BffEndpoints, OIDC_SESSION_COOKIE_NAME } from './config';
import { getOIDCCookieData, queryParams } from './helpers/app';
import { cacheOverview } from './helpers/file-cache';
import { fetchCMSCONTENT } from './services';
import { fetchMaintenanceNotificationsActual } from './services/cms-maintenance-notifications';

export const router = express.Router();

router.get(
  BffEndpoints.STATUS_HEALTH,
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ status: 'OK' });
    next();
  }
);

router.get(
  BffEndpoints.PUBLIC_HEALTH,
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ status: 'OK' });
    next();
  }
);

router.get(
  BffEndpoints.PUBLIC_CACHE_OVERVIEW,
  async (req: Request, res: Response, next: NextFunction) => {
    const overview = await cacheOverview();
    res.json(overview);
    next();
  }
);

router.get(BffEndpoints.PUBLIC_CMS_CONTENT, async (req, res, next) => {
  const requestID = res.locals.requestID;
  try {
    const response = await fetchCMSCONTENT(requestID, queryParams(req));
    res.json(response);
    next();
  } catch (error) {
    next(error);
  }
});

router.get(
  BffEndpoints.PUBLIC_CMS_MAINTENANCE_NOTIFICATIONS,
  async (req, res, next) => {
    const requestID = res.locals.requestID;
    try {
      const response = await fetchMaintenanceNotificationsActual(
        requestID,
        queryParams(req)
      );
      res.json(response);
      next();
    } catch (error) {
      next(error);
    }
  }
);

router.get(BffEndpoints.PUBLIC_TEMP, async (req, res, next) => {
  // const requestID = res.locals.requestID;
  try {
    const cookieData = getOIDCCookieData(req.cookies[OIDC_SESSION_COOKIE_NAME]);
    // const authProfileAndToken = getAuth(req);
    // Sentry.captureMessage('Token value', {
    //   extra: {
    //     ...authProfileAndToken,
    //   },
    // });
    // const response = await fetchSubsidie(requestID, authProfileAndToken);
    res.json(cookieData);
    next();
  } catch (error) {
    next(error);
  }
});
