import {
  loadServicesAfval,
  loadServicesCMSContent,
  loadServicesDirect,
  loadServicesGenerated,
  loadServicesMap,
  loadServicesRelated,
  loadServicesTips,
} from './index';

export async function loadServicesAll(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  optin: boolean
) {
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

  const serviceResults = await Promise.all([
    servicesDirectPromise,
    servicesRelatePromise,
    servicesMapPromise,
    servicesCMSContPromise,
    servicesAfvalPromise,
    servicesGeneratedPromise,
  ]);

  const tipsRequestDataServiceResults = await Promise.all([
    servicesDirectPromise,
    servicesRelatePromise,
  ]);

  const tipsResult = await loadServicesTips(
    sessionID,
    passthroughRequestHeaders,
    tipsRequestDataServiceResults,
    optin
  );

  const responseAll = Object.assign({}, tipsResult);

  // Merge all service results into 1 response object
  return serviceResults.reduce(
    (acc, result) => Object.assign(acc, result),
    responseAll
  );
}
