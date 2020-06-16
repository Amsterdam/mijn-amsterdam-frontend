import { NextFunction, Request, Response } from 'express';
import { getSamlTokenHeader } from '../helpers/request';
import { loadServicesCMSContent } from './services-cmscontent';
import { loadServicesDirect } from './services-direct';
import { loadServicesGenerated } from './services-generated';
import { loadServicesMap } from './services-map';
import { loadServicesRelated } from './services-related';

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

  const servicesDirect = loadServicesDirect(
    req.sessionID!,
    getSamlTokenHeader(req)
  ).then(data => {
    sendMessage(res, 'direct', 'message', data);
  });

  const servicesRelated = loadServicesRelated(
    req.sessionID!,
    getSamlTokenHeader(req)
  ).then(data => {
    sendMessage(res, 'related', 'message', data);
  });

  const servicesMap = loadServicesMap(
    req.sessionID!,
    getSamlTokenHeader(req)
  ).then(data => {
    sendMessage(res, 'map', 'message', data);
  });

  const servicesGenerated = loadServicesGenerated(
    req.sessionID!,
    getSamlTokenHeader(req),
    req.cookies.optInPersonalizedTips === 'yes'
  ).then(data => {
    sendMessage(res, 'generated', 'message', data);
  });

  const servicesCMSContent = loadServicesCMSContent(
    req.sessionID!,
    getSamlTokenHeader(req)
  ).then(data => {
    sendMessage(res, 'cmscontent', 'message', data);
  });

  await Promise.allSettled([
    servicesDirect,
    servicesRelated,
    servicesMap,
    servicesGenerated,
    servicesCMSContent,
  ]).finally(() => {
    sendMessage(res, 'close', 'close', null);
    res.end();
  });
}
