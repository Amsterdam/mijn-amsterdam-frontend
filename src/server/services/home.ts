import { apiDependencyError, isMokum } from '../../universal/helpers';
import { apiErrorResult, apiSuccesResult } from '../../universal/helpers/api';
import { fetchBAG, fetchBRP } from './index';
import { fetchKVK, getKvkAddress } from './kvk';
import { DEFAULT_LAT, DEFAULT_LNG } from '../../universal/config/map';

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
    if (!HOME.content?.latlng) {
      HOME = apiSuccesResult({
        latlng: {
          lat: DEFAULT_LAT,
          lng: DEFAULT_LNG,
        },
        address: null,
      });
    }
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

  if (KVK.status === 'OK') {
    const address = KVK.content ? getKvkAddress(KVK.content) : null;
    if (address) {
      HOME = await fetchBAG(sessionID, passthroughRequestHeaders, address);

      if (!HOME.content?.latlng) {
        HOME = apiSuccesResult({
          latlng: {
            lat: DEFAULT_LAT,
            lng: DEFAULT_LNG,
          },
          address: null,
        });
      }
    } else {
      HOME = apiErrorResult('Could not query BAG: address missing.', null);
    }
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
    case 'private-commercial':
    case 'commercial':
      return fetchCommercial(sessionID, passthroughRequestHeaders);

    case 'private':
    default:
      return fetchPrivate(sessionID, passthroughRequestHeaders);
  }
}
