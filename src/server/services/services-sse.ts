import { loadServicesDirect } from './services-direct';
import { loadServicesRelated } from './services-related';
import { loadServicesMap } from './services-map';
import { loadServicesGenerated } from './services-generated';
import { clearCache } from '../helpers/request';
import { Response, Request } from 'express';

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

export async function loadServicesSSE(req: Request, res: Response) {
  // Tell the client we respond with an event stream
  res.writeHead(200, {
    'content-type': 'text/event-stream',
    'cache-control': 'no-cache',
    connection: 'keep-alive',
  });

  const servicesDirect = loadServicesDirect(req.sessionID!).then(data => {
    sendMessage(res, 'direct', 'message', data);
  });

  const servicesRelated = loadServicesRelated(req.sessionID!).then(data => {
    sendMessage(res, 'related', 'message', data);
  });

  const servicesMap = loadServicesMap(req.sessionID!).then(data => {
    sendMessage(res, 'map', 'message', data);
  });

  const servicesGenerated = loadServicesGenerated(
    req.sessionID!,
    req.query.optin === '1'
  ).then(data => {
    sendMessage(res, 'generated', 'message', data);
  });

  Promise.all([
    servicesDirect,
    servicesRelated,
    servicesMap,
    servicesGenerated,
  ]).finally(() => {
    clearCache(req.sessionID!);
    sendMessage(res, 'close', 'close', null);
  });
}
