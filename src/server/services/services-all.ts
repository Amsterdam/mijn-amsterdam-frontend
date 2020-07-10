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
  samlToken: string,
  optin: boolean
) {
  const servicesDirectPromise = loadServicesDirect(sessionID, samlToken);
  const servicesRelatePromise = loadServicesRelated(sessionID, samlToken);
  const servicesMapPromise = loadServicesMap(sessionID, samlToken);
  const servicesCMSContPromise = loadServicesCMSContent(sessionID, samlToken);
  const servicesAfvalPromise = loadServicesAfval(sessionID, samlToken);
  const servicesGeneratedPromise = loadServicesGenerated(sessionID, samlToken);

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
    samlToken,
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
