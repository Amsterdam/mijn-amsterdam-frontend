import express, { NextFunction, Request, Response } from 'express';
import { BffEndpoints } from './config';
import { loadServicesAllCommercial } from './services/services-all-commercial';
import { loadServicesSSECommercial } from './services/services-sse-commercial';

export const routerCommercial = express.Router();

routerCommercial.get(
  BffEndpoints.SERVICES_ALL,
  async function handleRouteServicesAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const servicesResult = await loadServicesAllCommercial(
        res.locals.sessionID,
        req
      );
      res.json(servicesResult);
    } catch (error) {
      next(error);
    }
  }
);

routerCommercial.get(BffEndpoints.SERVICES_STREAM, loadServicesSSECommercial);
