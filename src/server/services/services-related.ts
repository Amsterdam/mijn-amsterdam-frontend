import { getSettledResult } from '../../universal/helpers/api';
import { fetchHOME } from './home';
import { fetchBRP } from './index';
import { fetchKVK } from './kvk';
import { getProfileType } from '../helpers/profile-type';

export async function loadServicesRelated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const BRPResult = fetchBRP(sessionID, passthroughRequestHeaders);
  const KVKResult = fetchKVK(sessionID, passthroughRequestHeaders);

  const HOMEResult = fetchHOME(sessionID, passthroughRequestHeaders);

  const [BRP, KVK, HOME] = await Promise.allSettled([
    BRPResult,
    KVKResult,
    HOMEResult,
  ]);

  return {
    BRP: getSettledResult(BRP),
    HOME: getSettledResult(HOME),
    KVK: getSettledResult(KVK),
  };
}
