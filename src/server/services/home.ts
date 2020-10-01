import { apiDependencyError, isMokum } from '../../universal/helpers';
import { apiErrorResult, apiSuccesResult } from '../../universal/helpers/api';
import { fetchBAG, fetchBRP } from './index';
import { fetchKVK, getKvkAddress } from './kvk';

async function fetchPrivate(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const BRP = await fetchBRP(sessionID, passthroughRequestHeaders);

  let HOME;

  if (BRP.status === 'OK' && isMokum(BRP.content)) {
    HOME = await fetchBAG(
      sessionID,
      passthroughRequestHeaders,
      BRP.content.adres
    );
  } else if (BRP.status === 'OK' && !isMokum(BRP.content)) {
    HOME = apiSuccesResult({
      latlng: null,
      address: null,
    });
  } else {
    HOME = apiDependencyError({ BRP });
  }

  return HOME;
}

async function fetchCommercial(
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

export async function fetchHOME(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  profileType: ProfileType
) {
  switch (profileType) {
    default:
    case 'private':
      return fetchPrivate(sessionID, passthroughRequestHeaders);
    case 'commercial':
      return fetchCommercial(sessionID, passthroughRequestHeaders);
  }
}
