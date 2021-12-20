import { apiDependencyError, isMokum } from '../../universal/helpers';
import { apiErrorResult, apiSuccesResult } from '../../universal/helpers/api';
import { fetchBAG, fetchBRP } from './index';
import { fetchKVK, getKvkAddress } from './kvk';
import { DEFAULT_LAT, DEFAULT_LNG } from '../../universal/config/buurt';

async function fetchPrivate(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const BRP = await fetchBRP(sessionID, passthroughRequestHeaders);

  let MY_LOCATION;

  if (BRP.status === 'OK' && isMokum(BRP.content)) {
    MY_LOCATION = await fetchBAG(
      sessionID,
      passthroughRequestHeaders,
      BRP.content.adres
    );
    if (!MY_LOCATION.content?.latlng) {
      MY_LOCATION = apiSuccesResult({
        latlng: {
          lat: DEFAULT_LAT,
          lng: DEFAULT_LNG,
        },
        address: null,
      });
    }
  } else if (BRP.status === 'OK' && !isMokum(BRP.content)) {
    MY_LOCATION = apiSuccesResult({
      latlng: null,
      address: null,
    });
  } else {
    MY_LOCATION = apiDependencyError({ BRP });
  }

  return MY_LOCATION;
}

async function fetchCommercial(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const KVK = await fetchKVK(sessionID, passthroughRequestHeaders);

  let MY_LOCATION;

  if (KVK.status === 'OK') {
    const address = KVK.content ? getKvkAddress(KVK.content) : null;
    if (address) {
      MY_LOCATION = await fetchBAG(
        sessionID,
        passthroughRequestHeaders,
        address
      );

      if (!MY_LOCATION.content?.latlng) {
        MY_LOCATION = apiSuccesResult({
          latlng: {
            lat: DEFAULT_LAT,
            lng: DEFAULT_LNG,
          },
          address: null,
        });
      }
    } else {
      MY_LOCATION = apiErrorResult(
        'Could not query BAG: address missing.',
        null
      );
    }
  } else {
    MY_LOCATION = apiDependencyError({ KVK });
  }

  return MY_LOCATION;
}

export async function fetchMyLocation(
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
