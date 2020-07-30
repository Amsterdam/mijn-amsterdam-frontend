import express, { NextFunction, Request, Response } from 'express';
import { BffEndpoints } from './config';
import { loadServicesAllCommercial } from './services/services-all-commercial';
import { loadServicesSSECommercial } from './services/services-sse-commercial';
import { getPassthroughRequestHeaders } from './helpers/app';

export const routerCommercial = express.Router();

routerCommercial.get(BffEndpoints.SERVICES_TIPS, async function handleRouteTips(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const optin = req.cookies.optInPersonalizedTips === 'yes';
    const data = await loadServicesAllCommercial(
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
      const servicesResult = await loadServicesAllCommercial(
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
