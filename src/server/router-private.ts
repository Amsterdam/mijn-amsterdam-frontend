import express, { NextFunction, Request, Response } from 'express';
import { BffEndpoints } from './config';
import { loadServicesAll } from './services/services-all';
import { loadServicesSSE } from './services/services-sse';

export const routerPrivate = express.Router();

routerPrivate.get(
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

routerPrivate.get(BffEndpoints.SERVICES_STREAM, loadServicesSSE);
