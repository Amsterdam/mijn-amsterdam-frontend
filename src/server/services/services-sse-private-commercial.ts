import { NextFunction, Request, Response } from 'express';
import {
  addServiceResultHandler,
  getPassthroughRequestHeaders,
  sendMessage,
} from '../helpers/app';
import { fetchHOMECommercial } from './home-commercial';
import { loadServicesAfvalCommercial } from './services-afval-commercial';
import { loadServicesMapCommercial } from './services-map-commercial';
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

  const serviceHome = fetchHOMECommercial(sessionID, passThroughHeaders).then(
    HOME => {
      return {
        HOME,
      };
    }
  );

  addServiceResultHandler(res, serviceHome, 'home');

  const servicesAfval = loadServicesAfvalCommercial(
    sessionID,
    passThroughHeaders
  );

  addServiceResultHandler(res, servicesAfval, 'afval');

  const servicesMap = loadServicesMapCommercial(sessionID, passThroughHeaders);

  addServiceResultHandler(res, servicesMap, 'map');

  const servicesTips = loadServicesTips(sessionID, req);

  addServiceResultHandler(res, servicesTips, 'tips');

  // Wait for all services to have responded and then end the stream.
  Promise.allSettled([servicesAfval, servicesMap, servicesTips]).then(() => {
    sendMessage(res, 'close', 'close', null);
    next();
  });
}
