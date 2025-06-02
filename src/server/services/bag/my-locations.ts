import { fetchBAG } from './bag';
import { BAGData } from './bag.types';
import {
  DEFAULT_LAT,
  DEFAULT_LNG,
} from '../../../universal/config/myarea-datasets';
import {
  ApiResponse_DEPRECATED,
  apiDependencyError,
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { isMokum } from '../../../universal/helpers/brp';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { fetchBRP } from '../profile/brp';
import type { Adres } from '../profile/brp.types';
import { fetchKVK, getKvkAddresses } from '../profile/kvk';

async function fetchPrivate(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse_DEPRECATED<BAGData[] | null>> {
  const BRP = await fetchBRP(authProfileAndToken);

  if (BRP.status === 'OK') {
    if (isMokum(BRP.content)) {
      const BAGLocation = (await fetchBAG(BRP.content.adres))?.content;

      if (!BAGLocation?.latlng) {
        return apiSuccessResult([
          {
            latlng: {
              lat: DEFAULT_LAT,
              lng: DEFAULT_LNG,
            },
            address: null,
            bagAddress: null,
            profileType: 'private',
          },
        ]);
      }
      return apiSuccessResult([
        Object.assign(BAGLocation, { profileType: 'private' }),
      ]);
    }
    return apiSuccessResult([
      {
        latlng: null,
        address: null,
        bagAddress: null,
        profileType: 'private',
      },
    ]);
  }

  return apiDependencyError({ BRP });
}

async function fetchCommercial(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse_DEPRECATED<BAGData[] | null>> {
  const KVK = await fetchKVK(authProfileAndToken);

  let MY_LOCATION: ApiResponse_DEPRECATED<BAGData[] | null>;

  if (KVK.status === 'OK') {
    const addresses: Adres[] = getKvkAddresses(KVK.content);

    if (addresses.length) {
      const locations = await Promise.all(
        addresses.map((address) => fetchBAG(address))
      ).then((results) => {
        return results
          .map((result) =>
            result.content !== null
              ? Object.assign(result.content, {
                  profileType: 'commercial',
                })
              : null
          )
          .filter((location) => location !== null);
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
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse_DEPRECATED<BAGData[] | null>> {
  const commercialResponse = await fetchCommercial(authProfileAndToken);

  if (authProfileAndToken.profile.profileType === 'commercial') {
    return commercialResponse;
  }

  const { content: privateAddresses } = await fetchPrivate(authProfileAndToken);

  const locations: BAGData[] = [
    ...(privateAddresses || []),
    ...(commercialResponse.content || []),
  ].filter((location) => location !== null);

  if (locations.length === 0) {
    return apiErrorResult('Could not fetch locations.', null);
  }

  return apiSuccessResult(locations);
}

export const forTesting = {
  fetchPrivate,
  fetchCommercial,
};
