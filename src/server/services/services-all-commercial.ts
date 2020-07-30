import { Request } from 'express';
import { getPassthroughRequestHeaders } from '../helpers/app';
import {
  loadServicesAfvalCommercial,
  loadServicesCMSContent,
  loadServicesDirectCommercial,
  loadServicesGeneratedCommercial,
  loadServicesMapCommercial,
  loadServicesRelatedCommercial,
  loadServicesTips,
} from './index';

export async function loadServicesAllCommercial(
  sessionID: SessionID,
  req: Request
) {
  const passthroughRequestHeaders = getPassthroughRequestHeaders(req);

  const servicesDirectPromise = loadServicesDirectCommercial(
    sessionID,
    passthroughRequestHeaders
  );
  const servicesRelatePromise = loadServicesRelatedCommercial(
    sessionID,
    passthroughRequestHeaders
  );
  const servicesMapPromise = loadServicesMapCommercial(
    sessionID,
    passthroughRequestHeaders
  );
  const servicesCMSContPromise = loadServicesCMSContent(
    sessionID,
    passthroughRequestHeaders
  );
  const servicesAfvalPromise = loadServicesAfvalCommercial(
    sessionID,
    passthroughRequestHeaders
  );
  const servicesGeneratedPromise = loadServicesGeneratedCommercial(
    sessionID,
    passthroughRequestHeaders
  );

  req.query.profileType = 'commercial';
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
