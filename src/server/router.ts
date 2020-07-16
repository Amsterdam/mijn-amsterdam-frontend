import express, { NextFunction, Request, Response } from 'express';
import { BffEndpoints } from './config';
import { loadServicesAll } from './services/services-all';
import { loadServicesSSE } from './services/services-sse';
import { getPassthroughRequestHeaders } from './helpers/app';

export const router = express.Router();

router.get(BffEndpoints.SERVICES_TIPS, async function handleRouteTips(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const optin = req.query.optin === 'true';
    const data = await loadServicesAll(
      res.locals.sessionID,
      getPassthroughRequestHeaders(req),
      optin
    );
    res.json(data.TIPS);
    next();
  } catch (error) {
    next(error);
  }
});

router.get(BffEndpoints.SERVICES_ALL, async function handleRouteServicesAll(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const optin = req.cookies.optInPersonalizedTips === 'yes';
    const servicesResult = await loadServicesAll(
      res.locals.sessionID,
      getPassthroughRequestHeaders(req),
      optin
    );
    res.json(servicesResult);
  } catch (error) {
    next(error);
  }
});

router.get(BffEndpoints.SERVICES_STREAM, loadServicesSSE);

router.get(
  BffEndpoints.HEALTH,
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ status: 'OK' });
    next();
  }
);
