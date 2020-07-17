import * as Sentry from '@sentry/node';
import { Request, Response, NextFunction } from 'express';
import {
  loadServicesAfval,
  loadServicesCMSContent,
  loadServicesDirect,
  loadServicesGenerated,
  loadServicesMap,
  loadServicesRelated,
  loadServicesTips,
} from './index';
import { getPassthroughRequestHeaders, sessionID } from '../helpers/app';
import { fetchKVK } from './kvk';

function sendMessage(
  res: Response,
  id: string,
  event: string = 'message',
  data: any
) {
  const doStringify = typeof data !== 'string';
  const payload = doStringify ? JSON.stringify(data) : data;
  const message = `event: ${event}\nid: ${id}\ndata: ${payload}\n\n`;
  res.write(message);
  res.flush();
}

function addServiceResultHandler(
  res: Response,
  servicePromise: Promise<any>,
  serviceName: string
) {
  return servicePromise
    .then(data => {
      sendMessage(res, serviceName, 'message', data);
      return data;
    })
    .catch(error =>
      Sentry.captureException(error, {
        extra: { module: 'services-sse', serviceName },
      })
    );
}

export async function loadServicesSSECommercial(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Tell the client we respond with an event stream
  res.writeHead(200, {
    'content-type': 'text/event-stream',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
  });

  const sessionID = res.locals.sessionID;

  const servicesKVK = new Promise((resolve, reject) =>
    fetchKVK(sessionID, getPassthroughRequestHeaders(req)).then(KVK => {
      resolve({ KVK });
    })
  );

  addServiceResultHandler(res, servicesKVK, 'kvk');

  Promise.allSettled([servicesKVK]).then(() => {
    sendMessage(res, 'close', 'close', null);
    next();
  });
}

export async function loadServicesSSE(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Tell the client we respond with an event stream
  res.writeHead(200, {
    'content-type': 'text/event-stream',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
  });

  const sessionID = res.locals.sessionID;

  const servicesDirect = loadServicesDirect(
    sessionID,
    getPassthroughRequestHeaders(req)
  );

  addServiceResultHandler(res, servicesDirect, 'direct');

  const servicesRelated = loadServicesRelated(
    sessionID,
    getPassthroughRequestHeaders(req)
  );

  addServiceResultHandler(res, servicesRelated, 'related');

  const servicesAfval = loadServicesAfval(
    sessionID,
    getPassthroughRequestHeaders(req)
  );

  addServiceResultHandler(res, servicesAfval, 'afval');

  const servicesMap = loadServicesMap(
    sessionID,
    getPassthroughRequestHeaders(req)
  );

  addServiceResultHandler(res, servicesMap, 'map');

  const servicesCMSContent = loadServicesCMSContent(
    sessionID,
    getPassthroughRequestHeaders(req)
  );

  addServiceResultHandler(res, servicesCMSContent, 'cmscontent');

  const servicesGenerated = loadServicesGenerated(
    sessionID,
    getPassthroughRequestHeaders(req)
  );

  addServiceResultHandler(res, servicesGenerated, 'generated');

  const tipsRequestDataServiceResults = await Promise.all([
    servicesDirect,
    servicesRelated,
  ]);

  const optin = req.cookies.optInPersonalizedTips === 'yes';

  const servicesTips = loadServicesTips(
    sessionID,
    getPassthroughRequestHeaders(req),
    tipsRequestDataServiceResults,
    optin
  );

  addServiceResultHandler(res, servicesTips, 'tips');

  // Wait for all services to have responded and then end the stream.
  Promise.allSettled([
    servicesDirect,
    servicesRelated,
    servicesAfval,
    servicesMap,
    servicesCMSContent,
    servicesGenerated,
    servicesTips,
  ]).then(() => {
    sendMessage(res, 'close', 'close', null);
    next();
  });
}
