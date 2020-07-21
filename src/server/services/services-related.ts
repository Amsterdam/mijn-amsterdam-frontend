import { fetchBRP } from './index';
import { fetchHOME } from './home';
import { fetchKVK } from './kvk';
import { apiDependencyError } from '../../universal/helpers/api';

export async function loadServicesRelated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const BRP = await fetchBRP(sessionID, passthroughRequestHeaders);
  const HOME = await fetchHOME(sessionID, passthroughRequestHeaders);

  let KVK;

  if (BRP.status === 'OK') {
    KVK = await fetchKVK(
      sessionID,
      passthroughRequestHeaders,
      BRP.content.kvkNummer
    );
  } else {
    KVK = apiDependencyError({ BRP });
  }

  return {
    BRP,
    HOME,
    KVK,
  };
}
