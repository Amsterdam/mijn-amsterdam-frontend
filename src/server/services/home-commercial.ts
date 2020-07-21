import { fetchBAG } from './index';
import { apiSuccesResult } from '../../universal/helpers/api';
import { apiDependencyError, isMokum } from '../../universal/helpers';
import { fetchKVK } from './kvk';

export async function fetchHOMECommercial(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const KVK = await fetchKVK(sessionID, passthroughRequestHeaders);

  let HOME;

  if (KVK.status === 'OK' && isMokum(KVK.content)) {
    HOME = await fetchBAG(
      sessionID,
      passthroughRequestHeaders,
      KVK.content.address
    );
  } else if (KVK.status === 'OK' && !isMokum(KVK.content)) {
    HOME = apiSuccesResult({
      latlng: null,
    });
  } else {
    HOME = apiDependencyError({ KVK });
  }

  return HOME;
}
