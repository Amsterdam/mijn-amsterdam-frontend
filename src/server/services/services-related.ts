import { fetchBRP } from './index';
import { fetchHOME } from './home';
import { fetchKVK } from './kvk';

export async function loadServicesRelated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const BRP = await fetchBRP(sessionID, passthroughRequestHeaders);
  const HOME = await fetchHOME(sessionID, passthroughRequestHeaders);
  const KVK = await fetchKVK(sessionID, passthroughRequestHeaders);

  return {
    BRP,
    HOME,
    KVK,
  };
}
