import * as Sentry from '@sentry/node';
import { NextFunction, Request, Response } from 'express';
import { getSamlTokenHeader } from '../helpers/request';
import { loadServicesAfval } from './services-afval';
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
  )
    .then(data => {
      sendMessage(res, 'direct', 'message', data);
    })
    .catch(error =>
      Sentry.captureException(error, {
        extra: { module: 'services-sse', serviceName: 'direct' },
      })
    );

  const servicesRelated = loadServicesRelated(
    req.sessionID!,
    getSamlTokenHeader(req)
  )
    .then(data => {
      sendMessage(res, 'related', 'message', data);
    })
    .catch(error =>
      Sentry.captureException(error, {
        extra: { module: 'services-sse', serviceName: 'related' },
      })
    );

  const servicesAfval = loadServicesAfval(
    req.sessionID!,
    getSamlTokenHeader(req)
  )
    .then(data => {
      sendMessage(res, 'related', 'message', data);
    })
    .catch(error =>
      Sentry.captureException(error, {
        extra: { module: 'services-sse', serviceName: 'afval' },
      })
    );

  const servicesMap = loadServicesMap(req.sessionID!, getSamlTokenHeader(req))
    .then(data => {
      sendMessage(res, 'map', 'message', data);
    })
    .catch(error =>
      Sentry.captureException(error, {
        extra: { module: 'services-sse', serviceName: 'map' },
      })
    );

  const servicesGenerated = loadServicesGenerated(
    req.sessionID!,
    getSamlTokenHeader(req),
    req.cookies.optInPersonalizedTips === 'yes'
  )
    .then(data => {
      sendMessage(res, 'generated', 'message', data);
    })
    .catch(error =>
      Sentry.captureException(error, {
        extra: { module: 'services-sse', serviceName: 'generated' },
      })
    );

  const servicesCMSContent = loadServicesCMSContent(
    req.sessionID!,
    getSamlTokenHeader(req)
  )
    .then(data => {
      sendMessage(res, 'cmscontent', 'message', data);
    })
    .catch(error =>
      Sentry.captureException(error, {
        extra: { module: 'services-sse', serviceName: 'cmscontent' },
      })
    );

  await Promise.allSettled([
    servicesDirect,
    servicesRelated,
    servicesMap,
    servicesGenerated,
    servicesCMSContent,
    servicesAfval,
  ]).finally(() => {
    sendMessage(res, 'close', 'close', null);
    res.end();
  });
}
