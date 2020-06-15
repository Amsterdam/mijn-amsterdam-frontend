import { loadServicesDirect } from './services-direct';
import { loadServicesRelated } from './services-related';
import { unwrapApiResponseContent } from '../../universal/helpers/api';

export async function loadServicesRaw(sessionID: SessionID, samlToken: string) {
  const servicesResult = await Promise.all([
    loadServicesDirect(sessionID, samlToken, true),
    loadServicesRelated(sessionID!, samlToken, true),
  ]);

  return unwrapApiResponseContent(
    servicesResult.reduce((acc, result) => Object.assign(acc, result), {})
  );
}
