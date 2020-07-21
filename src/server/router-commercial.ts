import express, { NextFunction, Request, Response } from 'express';
import { BffEndpoints } from './config';
import { loadServicesAll } from './services/services-all';
import { loadServicesSSECommercial } from './services/services-sse';
import { getPassthroughRequestHeaders } from './helpers/app';

export const routerCommercial = express.Router();

routerCommercial.get(BffEndpoints.SERVICES_TIPS, async function handleRouteTips(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const optin = req.cookies.optInPersonalizedTips === 'yes';
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

routerCommercial.get(
  BffEndpoints.SERVICES_ALL,
  async function handleRouteServicesAll(
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
  }
);

routerCommercial.get(BffEndpoints.SERVICES_STREAM, loadServicesSSECommercial);
