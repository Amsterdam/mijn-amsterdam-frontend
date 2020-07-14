import * as Sentry from '@sentry/node';
import { Request, Response } from 'express';
import {
  loadServicesAfval,
  loadServicesCMSContent,
  loadServicesDirect,
  loadServicesGenerated,
  loadServicesMap,
  loadServicesRelated,
  loadServicesTips,
} from './index';
import { getPassthroughRequestHeaders } from '../helpers/request';

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

export async function loadServicesSSE(req: Request, res: Response) {
  // Tell the client we respond with an event stream
  res.writeHead(200, {
    'content-type': 'text/event-stream',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
  });

  const servicesDirect = loadServicesDirect(
    req.sessionID!,
    getPassthroughRequestHeaders(req)
  );

  addServiceResultHandler(res, servicesDirect, 'direct');

  const servicesRelated = loadServicesRelated(
    req.sessionID!,
    getPassthroughRequestHeaders(req)
  );

  addServiceResultHandler(res, servicesRelated, 'related');

  const servicesAfval = loadServicesAfval(
    req.sessionID!,
    getPassthroughRequestHeaders(req)
  );

  addServiceResultHandler(res, servicesAfval, 'afval');

  const servicesMap = loadServicesMap(
    req.sessionID!,
    getPassthroughRequestHeaders(req)
  );

  addServiceResultHandler(res, servicesMap, 'map');

  const servicesCMSContent = loadServicesCMSContent(
    req.sessionID!,
    getPassthroughRequestHeaders(req)
  );

  addServiceResultHandler(res, servicesCMSContent, 'cmscontent');

  const servicesGenerated = loadServicesGenerated(
    req.sessionID!,
    getPassthroughRequestHeaders(req)
  );

  addServiceResultHandler(res, servicesGenerated, 'generated');

  const tipsRequestDataServiceResults = await Promise.all([
    servicesDirect,
    servicesRelated,
  ]);

  const optin = req.cookies.optInPersonalizedTips === 'yes';

  const tipsResult = loadServicesTips(
    req.sessionID!,
    getPassthroughRequestHeaders(req),
    tipsRequestDataServiceResults,
    optin
  );

  addServiceResultHandler(res, tipsResult, 'tips');

  // Wait for all services to have responded and then end the stream.
  Promise.allSettled([
    servicesDirect,
    servicesRelated,
    servicesAfval,
    servicesMap,
    servicesCMSContent,
    servicesGenerated,
    tipsResult,
  ]).then(() => {
    sendMessage(res, 'close', 'close', null);
    res.end();
  });
}
