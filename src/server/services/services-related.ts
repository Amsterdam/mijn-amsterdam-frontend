import { fetchBRP } from './index';
import { fetchHOME } from './home';

export async function loadServicesRelated(
  sessionID: SessionID,
  samlToken: string,
  raw: boolean = false
) {
  const BRP = await fetchBRP(sessionID, samlToken, raw);
  const HOME = await fetchHOME(sessionID, samlToken);

  return {
    BRP,
    HOME,
  };
}
