import { BAGData, fetchBAG } from './bag';
import { fetchBRP } from './brp';
import { fetchKVK, getKvkAddresses } from './kvk';
import {
  DEFAULT_LAT,
  DEFAULT_LNG,
} from '../../universal/config/myarea-datasets';
import {
  ApiResponse,
  apiDependencyError,
  apiErrorResult,
  apiSuccessResult,
} from '../../universal/helpers/api';
import { isMokum } from '../../universal/helpers/brp';
import { Adres } from '../../universal/types';
import { AuthProfileAndToken } from '../auth/auth-types';

async function fetchPrivate(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<BAGData[] | null>> {
  const BRP = await fetchBRP(requestID, authProfileAndToken);

  if (BRP.status === 'OK') {
    if (isMokum(BRP.content)) {
      const location = (await fetchBAG(requestID, BRP.content.adres))?.content;

      // No BAG location found
      if (!location?.latlng) {
        return apiSuccessResult([
          {
            latlng: {
              lat: DEFAULT_LAT,
              lng: DEFAULT_LNG,
            },
            address: null,
            profileType: 'private',
          },
        ]);
      } else {
        // BAG Location found!
        return apiSuccessResult([
          Object.assign(location, { profileType: 'private' }),
        ]);
      }
    } else {
      // Not a Mokum address
      return apiSuccessResult([
        {
          latlng: null,
          address: null,
          profileType: 'private',
        },
      ]);
    }
  }

  return apiDependencyError({ BRP });
}

async function fetchCommercial(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const KVK = await fetchKVK(requestID, authProfileAndToken);

  let MY_LOCATION: ApiResponse<(BAGData | null)[] | null>;

  if (KVK.status === 'OK') {
    const addresses: Adres[] = getKvkAddresses(KVK.content);

    if (addresses.length) {
      const locations = await Promise.all(
        addresses.map((address) => fetchBAG(requestID, address))
      ).then((results) => {
        return results.map((result) =>
          result.content !== null
            ? Object.assign(result.content, {
                profileType: 'commercial',
              })
            : null
        );
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
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<(BAGData | null)[] | null>> {
  switch (authProfileAndToken.profile.profileType) {
    case 'commercial':
      return fetchCommercial(requestID, authProfileAndToken);

    case 'private':
    default: {
      const privateAddresses = await fetchPrivate(
        requestID,
        authProfileAndToken
      );
      const commercialAddresses = await fetchCommercial(
        requestID,
        authProfileAndToken
      );

      switch (true) {
        case privateAddresses.content !== null &&
          commercialAddresses.content !== null: {
          const locations: BAGData[] = [
            ...privateAddresses.content!.filter((a) => a !== null),
            ...commercialAddresses.content!.filter((a) => a !== null),
          ];
          return apiSuccessResult(locations);
        }
        case privateAddresses.content !== null:
          return privateAddresses;
      }
      return apiErrorResult('Could not fetch locations.', null);
    }
  }
}
