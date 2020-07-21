import { apiDependencyError } from '../../universal/helpers';
import { scrapeGarbageCenterData } from './afval/afvalpunten';
import { fetchHOME } from './home';
import { fetchAFVAL, fetchBRP } from './index';

export async function loadServicesAfval(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const BRP = await fetchBRP(sessionID, passthroughRequestHeaders);
  const HOME = await fetchHOME(sessionID, passthroughRequestHeaders);

  let AFVAL;
  let AFVALPUNTEN;

  if (HOME.status === 'OK') {
    AFVAL = await fetchAFVAL(
      sessionID,
      passthroughRequestHeaders,
      HOME.content?.latlng
    );
    AFVALPUNTEN = await scrapeGarbageCenterData(HOME.content?.latlng);
  } else {
    AFVAL = apiDependencyError({ BRP, HOME });
    AFVALPUNTEN = apiDependencyError({ BRP, HOME });
  }

  return {
    AFVAL,
    AFVALPUNTEN,
  };
}
