import {
  loadServicesAfval,
  loadServicesCMSContent,
  loadServicesDirect,
  loadServicesGenerated,
  loadServicesMap,
  loadServicesRelated,
  loadServicesTips,
} from './index';
import { Request } from 'express';
import { getPassthroughRequestHeaders } from '../helpers/app';

export async function loadServicesAll(sessionID: SessionID, req: Request) {
  const passthroughRequestHeaders = getPassthroughRequestHeaders(req);

  const servicesDirectPromise = loadServicesDirect(
    sessionID,
    passthroughRequestHeaders
  );
  const servicesRelatePromise = loadServicesRelated(
    sessionID,
    passthroughRequestHeaders
  );
  const servicesMapPromise = loadServicesMap(
    sessionID,
    passthroughRequestHeaders
  );
  const servicesCMSContPromise = loadServicesCMSContent(
    sessionID,
    passthroughRequestHeaders
  );
  const servicesAfvalPromise = loadServicesAfval(
    sessionID,
    passthroughRequestHeaders
  );
  const servicesGeneratedPromise = loadServicesGenerated(
    sessionID,
    passthroughRequestHeaders
  );

  const servicesTipsPromise = loadServicesTips(sessionID, req);

  const serviceResults = await Promise.all([
    servicesDirectPromise,
    servicesRelatePromise,
    servicesMapPromise,
    servicesCMSContPromise,
    servicesAfvalPromise,
    servicesGeneratedPromise,
    servicesTipsPromise,
  ]);

  // Merge all service results into 1 response object
  return serviceResults.reduce((acc, result) => Object.assign(acc, result), {});
}
