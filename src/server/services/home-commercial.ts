import { fetchBAG } from './index';
import { apiSuccesResult, apiErrorResult } from '../../universal/helpers/api';
import { apiDependencyError, isMokum } from '../../universal/helpers';
import { fetchKVK, getKvkAddress } from './kvk';

export async function fetchHOMECommercial(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const KVK = await fetchKVK(sessionID, passthroughRequestHeaders);

  let HOME;

  if (KVK.status === 'OK' && isMokum(KVK.content)) {
    const address = KVK.content ? getKvkAddress(KVK.content) : null;
    if (address) {
      HOME = await fetchBAG(sessionID, passthroughRequestHeaders, address);
    } else {
      HOME = apiErrorResult('Could not query BAG: address missing.', null);
    }
  } else if (KVK.status === 'OK' && !isMokum(KVK.content)) {
    HOME = apiSuccesResult({
      latlng: null,
      address: null,
    });
  } else {
    HOME = apiDependencyError({ KVK });
  }

  return HOME;
}
