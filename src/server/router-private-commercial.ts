import express, { NextFunction, Request, Response } from 'express';
import { BffEndpoints } from './config';
import { loadServicesAll } from './services/services-all';
import { loadServicesSSE } from './services/services-sse-private-commercial';

export const routerPrivateCommercial = express.Router();

routerPrivateCommercial.get(
  BffEndpoints.SERVICES_ALL,
  async function handleRouteServicesAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const servicesResult = await loadServicesAll(res.locals.sessionID, req);
      res.json(servicesResult);
    } catch (error) {
      next(error);
    }
  }
);

routerPrivateCommercial.get(BffEndpoints.SERVICES_STREAM, loadServicesSSE);
