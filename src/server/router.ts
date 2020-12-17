import * as Sentry from '@sentry/node';
import express, { NextFunction, Request, Response } from 'express';
import { BffEndpoints } from './config';
import { getPassthroughRequestHeaders } from './helpers/app';
import { fetchCMSCONTENT } from './services';
import {
  loadServicesAll,
  loadServicesSSE,
  loadServicesTips,
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
  async (req: Request, res: Response, next: NextFunction) => {
    // Tell the client we respond with an event stream
    res.writeHead(200, {
      'content-type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      connection: 'keep-alive',
    });
    res.write('retry: 1000\n');
    res.flush();
    try {
      await loadServicesSSE(req, res);
    } catch (error) {
      Sentry.captureException(error);
      res.end();
    }
  }
);

router.get(BffEndpoints.SERVICES_TIPS, loadServicesTips);

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
      req.query as Record<string, string>
    );
    res.json(response);
  } catch (error) {
    Sentry.captureException(error);
  }
  next();
});
