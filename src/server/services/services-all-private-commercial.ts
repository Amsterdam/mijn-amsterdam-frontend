import {
  loadServicesTips,
  loadServicesAfvalCommercial,
  loadServicesMapCommercial,
} from './index';
import { Request } from 'express';
import { getPassthroughRequestHeaders } from '../helpers/app';
import { fetchHOMECommercial } from './home-commercial';

export async function loadServicesAllPrivateCommercial(
  sessionID: SessionID,
  req: Request
) {
  const passThroughHeaders = getPassthroughRequestHeaders(req);

  const serviceHome = fetchHOMECommercial(sessionID, passThroughHeaders).then(
    HOME => {
      return {
        HOME,
      };
    }
  );

  const servicesAfval = loadServicesAfvalCommercial(
    sessionID,
    passThroughHeaders
  );

  const servicesMap = loadServicesMapCommercial(sessionID, passThroughHeaders);

  req.query.profileType = 'private-commerical';
  const servicesTips = loadServicesTips(sessionID, req);

  const serviceResults = await Promise.all([
    serviceHome,
    servicesAfval,
    servicesMap,
    servicesTips,
  ]);

  // Merge all service results into 1 response object
  return serviceResults.reduce((acc, result) => Object.assign(acc, result), {});
}
