import { NextFunction, Request, Response } from 'express';
import {
  addServiceResultHandler,
  getPassthroughRequestHeaders,
  sendMessage,
} from '../helpers/app';
import {
  loadServicesAfval,
  loadServicesCMSContent,
  loadServicesDirect,
  loadServicesGenerated,
  loadServicesMap,
  loadServicesRelated,
} from './index';
import { loadServicesTips } from './tips';

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
  const passThroughHeaders = getPassthroughRequestHeaders(req);

  const servicesDirect = loadServicesDirect(sessionID, passThroughHeaders);

  addServiceResultHandler(res, servicesDirect, 'direct');

  const servicesRelated = loadServicesRelated(sessionID, passThroughHeaders);

  addServiceResultHandler(res, servicesRelated, 'related');

  const servicesAfval = loadServicesAfval(sessionID, passThroughHeaders);

  addServiceResultHandler(res, servicesAfval, 'afval');

  const servicesMap = loadServicesMap(sessionID, passThroughHeaders);

  addServiceResultHandler(res, servicesMap, 'map');

  const servicesCMSContent = loadServicesCMSContent(
    sessionID,
    passThroughHeaders
  );

  addServiceResultHandler(res, servicesCMSContent, 'cmscontent');

  const servicesGenerated = loadServicesGenerated(
    sessionID,
    passThroughHeaders
  );

  addServiceResultHandler(res, servicesGenerated, 'generated');

  const servicesTips = loadServicesTips(sessionID, req);

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
