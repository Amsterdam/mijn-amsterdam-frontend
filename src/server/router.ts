import express, { Request, Response } from 'express';
import { API_BASE_URL, BFF_API_BASE_URL } from '../universal/config';
import {
  loadServicesGenerated,
  loadServicesDirect,
  loadServicesRelated,
} from './services';
import { loadServicesMap } from './services/services-map';
import { fetchBRP } from './services/brp';
import compression from 'compression';
import { cache } from './helpers/request';

export const router = express.Router();
export const eventSourceRouter = express.Router();

router.use(`${API_BASE_URL}/auth/check`, function handleAuthentication(
  req: Request,
  res: Response
) {
  const xSession =
    req.headers['x-session'] && JSON.parse(req.headers['x-session'] as string);

  const { userType, isAuthenticated, validUntil } = xSession || {
    userType: 'BURGER',
    validUntil: -1,
    isAuthenticated: false,
  };

  const response = {
    isAuthenticated,
    validUntil,
    userType,
  };

  return res.send(response);
});

router.use(
  `${BFF_API_BASE_URL}/services/generated`,
  async function handleRouteServicesGenerated(req: Request, res: Response) {
    return res.send(
      await loadServicesGenerated(req.sessionID!, req.query.optin === '1')
    );
  }
);

router.use(
  `${BFF_API_BASE_URL}/services/related`,
  async function handleRouteServicesRelated(req: Request, res: Response) {
    return res.send(await loadServicesRelated(req.sessionID!));
  }
);

router.use(
  `${BFF_API_BASE_URL}/services/direct`,
  async function handleRouteServicesDirect(req: Request, res: Response) {
    return res.send(await loadServicesDirect(req.sessionID!));
  }
);

router.use(
  `${BFF_API_BASE_URL}/services/map`,
  async function handleRouteServicesMap(req: Request, res: Response) {
    return res.send(await loadServicesMap(req.sessionID!));
  }
);

router.use(
  `${BFF_API_BASE_URL}/services/all`,
  async function handleRouteServicesMap(req: Request, res: Response) {
    const data = {
      ...(await loadServicesDirect(req.sessionID!)),
      ...(await loadServicesRelated(req.sessionID!)),
      ...(await loadServicesMap(req.sessionID!)),
      ...(await loadServicesGenerated(req.sessionID!, req.query.optin === '1')),
    };

    return res.send(data);
  }
);

function sendMessage(res: Response, id: string, data: any) {
  const doStringify = typeof data !== 'string';
  const payload = doStringify ? JSON.stringify(data) : data;
  const message = `event: message\nid: ${id}\ndata: ${payload}\n\n`;
  res.write(message);
}

eventSourceRouter.all('/stream', async function(req, res) {
  // Tell the client we respond with an event stream
  res.writeHead(200, {
    // Connection: 'keep-alive',
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
  });

  const servicesDirect = loadServicesDirect(req.sessionID!).then(data => {
    sendMessage(res, 'direct', data);
  });

  const servicesRelated = loadServicesRelated(req.sessionID!).then(data => {
    sendMessage(res, 'related', data);
  });

  const servicesMap = loadServicesMap(req.sessionID!).then(data => {
    sendMessage(res, 'map', data);
  });

  const servicesGenerated = loadServicesGenerated(
    req.sessionID!,
    req.query.optin === '1'
  ).then(data => {
    sendMessage(res, 'generated', data);
  });

  Promise.all([
    servicesDirect,
    servicesRelated,
    servicesMap,
    servicesGenerated,
  ]).finally(() => {
    for (const cacheKey of cache.keys()) {
      console.log(cacheKey, cacheKey.startsWith('testje'));
      if (cacheKey.startsWith('testje')) {
        cache.delete(cacheKey);
      }
    }
  });
});
