import { NextFunction, Request, Response } from 'express';
import {
  addServiceResultHandler,
  getPassthroughRequestHeaders,
  sendMessage,
} from '../helpers/app';
import {
  loadServicesAfval,
  loadServicesCMSContent,
  loadServicesDirectCommercial,
  loadServicesMap,
  loadServicesRelatedCommercial,
  loadServicesTips,
} from './index';
import { loadServicesGeneratedCommercial } from './services-generated-commercial';

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
  const passThroughHeaders = getPassthroughRequestHeaders(req);

  const servicesRelated = loadServicesRelatedCommercial(
    sessionID,
    passThroughHeaders
  );

  addServiceResultHandler(res, servicesRelated, 'related');

  const servicesDirect = loadServicesDirectCommercial(
    sessionID,
    passThroughHeaders
  );

  addServiceResultHandler(res, servicesDirect, 'direct');

  const servicesAfval = loadServicesAfval(sessionID, passThroughHeaders);

  addServiceResultHandler(res, servicesAfval, 'afval');

  const servicesMap = loadServicesMap(sessionID, passThroughHeaders);

  addServiceResultHandler(res, servicesMap, 'map');

  const servicesCMSContent = loadServicesCMSContent(
    sessionID,
    passThroughHeaders
  );

  addServiceResultHandler(res, servicesCMSContent, 'cmscontent');

  const servicesGenerated = loadServicesGeneratedCommercial(
    sessionID,
    passThroughHeaders
  );

  addServiceResultHandler(res, servicesGenerated, 'generated');

  const optin = req.cookies.optInPersonalizedTips === 'yes';

  const tipsRequestDataServiceResults = await Promise.all([
    servicesDirect,
    servicesRelated,
  ]);

  const servicesTips = loadServicesTips(
    sessionID,
    passThroughHeaders,
    tipsRequestDataServiceResults,
    optin
  );

  addServiceResultHandler(res, servicesTips, 'tips');

  Promise.allSettled([servicesRelated, servicesDirect, servicesTips]).then(
    () => {
      sendMessage(res, 'close', 'close', null);
      next();
    }
  );
}
