import { fetchBAG } from './index';
import { apiSuccesResult, apiErrorResult } from '../../universal/helpers/api';
import { apiDependencyError, isMokum } from '../../universal/helpers';
import { fetchKVK, Adres } from './kvk';

export async function fetchHOMECommercial(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const KVK = await fetchKVK(sessionID, passthroughRequestHeaders);

  let HOME;

  if (KVK.status === 'OK' && isMokum(KVK.content)) {
    let address: Adres | null = null;

    if (KVK.content?.vestigingen[0]?.bezoekadres) {
      address = KVK.content.vestigingen[0].bezoekadres;
    } else if (KVK.content?.vestigingen[0]?.postadres) {
      address = KVK.content.vestigingen[0].postadres;
    }
    if (address) {
      HOME = await fetchBAG(sessionID, passthroughRequestHeaders, address);
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
