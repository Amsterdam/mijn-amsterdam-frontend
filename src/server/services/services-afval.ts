import { apiDependencyError } from '../../universal/helpers';
import { scrapeGarbageCenterData } from './afval/afvalpunten';
import { fetchHOME } from './home';
import { fetchAFVAL } from './index';

export async function loadServicesAfval(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
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
    AFVAL = apiDependencyError({ HOME });
    AFVALPUNTEN = apiDependencyError({ HOME });
  }

  return {
    AFVAL,
    AFVALPUNTEN,
  };
}
