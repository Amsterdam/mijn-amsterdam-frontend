import {
  DEFAULT_LAT,
  DEFAULT_LNG,
} from '../../universal/config/myarea-datasets';
import { apiDependencyError, isMokum } from '../../universal/helpers';
import {
  apiErrorResult,
  ApiResponse,
  apiSuccessResult,
} from '../../universal/helpers/api';
import { Adres } from '../../universal/types';
import { AuthProfileAndToken } from '../helpers/app';
import { BAGData, fetchBAG, fetchBRP } from './index';
import { fetchKVK, getKvkAddresses } from './kvk';

async function fetchPrivate(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const BRP = await fetchBRP(requestID, authProfileAndToken);

  let MY_LOCATION: ApiResponse<(BAGData | null)[] | null>;

  if (BRP.status === 'OK' && isMokum(BRP.content)) {
    const location = (
      await fetchBAG(requestID, authProfileAndToken, BRP.content.adres)
    )?.content;

    // No BAG location found
    if (!location?.latlng) {
      MY_LOCATION = apiSuccessResult([
        {
          latlng: {
            lat: DEFAULT_LAT,
            lng: DEFAULT_LNG,
          },
          address: null,
        },
      ]);
    } else {
      // BAG Location found!
      MY_LOCATION = apiSuccessResult([location]);
    }
  } else if (BRP.status === 'OK' && !isMokum(BRP.content)) {
    // Not a Mokum address
    MY_LOCATION = apiSuccessResult([
      {
        latlng: null,
        address: null,
      },
    ]);
  } else {
    // Proper data concerning a Mokum location not found
    MY_LOCATION = apiDependencyError({ BRP });
  }

  return MY_LOCATION;
}

async function fetchCommercial(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const KVK = await fetchKVK(requestID, authProfileAndToken);

  let MY_LOCATION: ApiResponse<(BAGData | null)[] | null>;

  if (KVK.status === 'OK') {
    const addresses: Adres[] = getKvkAddresses(KVK.content);

    if (addresses.length) {
      const locations = await Promise.all(
        addresses.map((address) =>
          fetchBAG(requestID, authProfileAndToken, address)
        )
      ).then((results) => {
        return results.map((result) => result.content);
      });

      MY_LOCATION = apiSuccessResult(locations);
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
