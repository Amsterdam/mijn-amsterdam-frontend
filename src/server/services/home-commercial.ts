import { apiDependencyError, isMokum } from '../../universal/helpers';
import { apiErrorResult, apiSuccesResult } from '../../universal/helpers/api';
import { fetchBAG } from './index';
import { fetchKVK } from './kvk';

export async function fetchHOMECommercial(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const KVK = await fetchKVK(sessionID, passthroughRequestHeaders);

  let HOME;

  if (KVK.status === 'OK' && isMokum(KVK.content)) {
    if (KVK.content?.hoofdAdres) {
      HOME = await fetchBAG(
        sessionID,
        passthroughRequestHeaders,
        KVK.content?.hoofdAdres
      );
    } else {
      HOME = apiErrorResult('Could not query BAG: address missing.', null);
    }
  } else if (KVK.status === 'OK' && !isMokum(KVK.content)) {
    HOME = apiSuccesResult({
      latlng: null,
    });
  } else {
    HOME = apiDependencyError({ KVK });
  }

  return HOME;
}
