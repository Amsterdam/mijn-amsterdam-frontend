import { apiSuccesResult } from '../../universal/helpers';
import { fetchHOMECommercial } from './home-commercial';
import { getEmbedUrl } from './services-map';

export async function loadServicesMapCommercial(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const HOME = await fetchHOMECommercial(sessionID, passthroughRequestHeaders);

  return {
    BUURT: apiSuccesResult({
      embed: getEmbedUrl(HOME.content?.latlng || null),
    }),
  };
}
