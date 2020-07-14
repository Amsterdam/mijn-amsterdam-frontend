import { fetchBRP } from './index';
import { fetchHOME } from './home';

export async function loadServicesRelated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const BRP = await fetchBRP(sessionID, passthroughRequestHeaders);
  const HOME = await fetchHOME(sessionID, passthroughRequestHeaders);

  return {
    BRP,
    HOME,
  };
}
