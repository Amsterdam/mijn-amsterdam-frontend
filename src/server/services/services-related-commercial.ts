import { fetchHOMECommercial } from './home-commercial';
import { fetchKVK } from './kvk';

export async function loadServicesRelatedCommercial(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const KVK = await fetchKVK(sessionID, passthroughRequestHeaders);
  const HOME = await fetchHOMECommercial(sessionID, passthroughRequestHeaders);

  return {
    HOME,
    KVK,
  };
}
