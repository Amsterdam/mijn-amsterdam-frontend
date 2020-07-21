import { apiDependencyError, isMokum } from '../../universal/helpers';
import { apiSuccesResult } from '../../universal/helpers/api';
import { fetchBAG, fetchBRP } from './index';

export async function fetchHOME(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const BRP = await fetchBRP(sessionID, passthroughRequestHeaders);

  let HOME;

  if (BRP.status === 'OK' && isMokum(BRP.content)) {
    HOME = await fetchBAG(
      sessionID,
      passthroughRequestHeaders,
      BRP.content.adres
    );
  } else if (BRP.status === 'OK' && !isMokum(BRP.content)) {
    HOME = apiSuccesResult({
      latlng: null,
    });
  } else {
    HOME = apiDependencyError({ BRP });
  }

  return HOME;
}
