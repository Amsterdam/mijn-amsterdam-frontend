import * as Sentry from '@sentry/node';
import express, { NextFunction, Request, Response } from 'express';
import { BffEndpoints } from './config';
import { getPassthroughRequestHeaders, queryParams } from './helpers/app';
import { fetchCMSCONTENT } from './services';
import {
  loadServicesAll,
  loadServicesSSE,
  loadServicesTips,
  loadServicesTipsRequestDataOverview,
} from './services/controller';

export const router = express.Router();

router.get(
  BffEndpoints.SERVICES_ALL,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await loadServicesAll(req, res);
      res.json(response);
    } catch (error) {
      Sentry.captureException(error);
    }
    next();
  }
);

router.get(
  BffEndpoints.SERVICES_STREAM,
  (req: Request, res: Response, next: NextFunction) => {
    // See https://nodejs.org/api/net.html#net_socket_setnodelay_nodelay
    req.socket.setNoDelay(true);
    // Tell the client we respond with an event stream
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      connection: 'keep-alive',
    });
    res.write('retry: 1000\n');
    loadServicesSSE(req, res);
  }
);

router.get(BffEndpoints.SERVICES_TIPS, loadServicesTips);

// Function for easily extract the request data for the Tips service
router.get(
  BffEndpoints.SERVICES_TIPS_REQUEST_DATA_OVERVIEW,
  loadServicesTipsRequestDataOverview
);

router.get(
  BffEndpoints.HEALTH,
  (req: Request, res: Response, next: NextFunction) => {
    res.json({ status: 'OK' });
    next();
  }
);

router.get(BffEndpoints.CMS_CONTENT, async (req, res, next) => {
  const sessionID = res.locals.sessionID;
  try {
    const response = await fetchCMSCONTENT(
      sessionID,
      getPassthroughRequestHeaders(req),
      queryParams(req)
    );
    res.json(response);
  } catch (error) {
    Sentry.captureException(error);
  }
  next();
});
