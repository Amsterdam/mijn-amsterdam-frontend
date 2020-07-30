import { apiDependencyError } from '../../universal/helpers';
import { scrapeGarbageCenterData } from './afval/afvalpunten';
import { fetchAFVAL } from './index';
import { fetchHOMECommercial } from './home-commercial';

export async function loadServicesAfvalCommercial(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const HOME = await fetchHOMECommercial(sessionID, passthroughRequestHeaders);

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
