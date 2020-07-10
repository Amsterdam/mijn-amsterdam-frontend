import { fetchBRP } from './index';
import { fetchHOME } from './home';

export async function loadServicesRelated(
  sessionID: SessionID,
  samlToken: string
) {
  const BRP = await fetchBRP(sessionID, samlToken);
  const HOME = await fetchHOME(sessionID, samlToken);

  return {
    BRP,
    HOME,
  };
}
