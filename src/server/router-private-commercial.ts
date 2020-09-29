import express, { NextFunction, Request, Response } from 'express';
import { BffEndpoints } from './config';
import { loadServicesAll } from './services/services-all';
import { loadServicesSSE } from './services/services-sse-private-commercial';
import { loadServicesAllPrivateCommercial } from './services/services-all-private-commercial';

export const routerPrivateCommercial = express.Router();

routerPrivateCommercial.get(
  BffEndpoints.SERVICES_ALL,
  async function handleRouteServicesAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      let serviceResultsAll = {};
      if (!req.query.incremental) {
        serviceResultsAll = await loadServicesAll(res.locals.sessionID, req);
      }
      const serviceResult = await loadServicesAllPrivateCommercial(
        res.locals.sessionID,
        req
      );

      console.log(serviceResultsAll, serviceResult);

      res.json({ ...serviceResultsAll, ...serviceResult });
    } catch (error) {
      next(error);
    }
  }
);

routerPrivateCommercial.get(BffEndpoints.SERVICES_STREAM, loadServicesSSE);
