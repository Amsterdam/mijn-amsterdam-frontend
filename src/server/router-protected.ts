import * as Sentry from '@sentry/node';
import express, { NextFunction, Request, Response } from 'express';
import proxy from 'express-http-proxy';
import { BffEndpoints, BFF_MS_API_BASE_URL } from './config';
import { getAuth, isProtectedRoute } from './helpers/app';
import { isAuthenticated } from './router-auth';
import {
  loadServicesAll,
  loadServicesSSE,
  loadServicesTips,
  loadServicesTipsRequestDataOverview,
} from './services/controller';

export const router = express.Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  // Skip router if we've entered a public route.
  if (!isProtectedRoute(req.path)) {
    return next('router');
  }
  return next();
}, isAuthenticated());

router.get(
  BffEndpoints.SERVICES_ALL,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const response = await loadServicesAll(req, res);
      res.json(response);
      next();
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  BffEndpoints.SERVICES_STREAM,
  (req: Request, res: Response, next: NextFunction) => {
    // See https://nodejs.org/api/net.html#net_socket_setnodelay_nodelay
    req.socket.setNoDelay(true);
    // Tell the client we respond with an event stream
    res.writeHead(200, {
      'Content-type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
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

router.use(
  BffEndpoints.API_RELAY,
  proxy(BFF_MS_API_BASE_URL, {
    proxyReqPathResolver: function (req) {
      Sentry.captureMessage('proxied url', {
        extra: {
          url: req.url,
        },
      });
      return req.url;
    },
    proxyReqOptDecorator: async function (proxyReqOpts, srcReq) {
      const { token } = await getAuth(srcReq);
      // you can update headers
      const headers = proxyReqOpts.headers || {};
      headers['Authorization'] = `Bearer ${token}`;
      return proxyReqOpts;
    },
  })
);
