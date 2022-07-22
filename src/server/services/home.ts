import {
  DEFAULT_LAT,
  DEFAULT_LNG,
} from '../../universal/config/myarea-datasets';
import { apiDependencyError, isMokum } from '../../universal/helpers';
import { apiErrorResult, apiSuccessResult } from '../../universal/helpers/api';
import { AuthProfileAndToken } from '../helpers/app';
import { fetchBAG, fetchBRP } from './index';
import { fetchKVK, getKvkAddress } from './kvk';

async function fetchPrivate(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const BRP = await fetchBRP(requestID, authProfileAndToken);

  let MY_LOCATION;

  if (BRP.status === 'OK' && isMokum(BRP.content)) {
    MY_LOCATION = await fetchBAG(
      requestID,
      authProfileAndToken,
      BRP.content.adres
    );

    if (!MY_LOCATION.content?.latlng) {
      MY_LOCATION = apiSuccessResult({
        latlng: {
          lat: DEFAULT_LAT,
          lng: DEFAULT_LNG,
        },
        address: null,
      });
    }
  } else if (BRP.status === 'OK' && !isMokum(BRP.content)) {
    MY_LOCATION = apiSuccessResult({
      latlng: null,
      address: null,
    });
  } else {
    MY_LOCATION = apiDependencyError({ BRP });
  }

  return MY_LOCATION;
}

async function fetchCommercial(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const KVK = await fetchKVK(requestID, authProfileAndToken);

  let MY_LOCATION;

  if (KVK.status === 'OK') {
    const address = KVK.content ? getKvkAddress(KVK.content) : null;
    if (address) {
      MY_LOCATION = await fetchBAG(requestID, authProfileAndToken, address);

      if (!MY_LOCATION.content?.latlng) {
        MY_LOCATION = apiSuccessResult({
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
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  profileType: ProfileType
) {
  switch (profileType) {
    case 'private-commercial':
    case 'commercial':
      return fetchCommercial(requestID, authProfileAndToken);

    case 'private':
    default:
      return fetchPrivate(requestID, authProfileAndToken);
  }
}
