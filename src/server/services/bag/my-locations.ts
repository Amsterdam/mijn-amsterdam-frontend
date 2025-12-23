import { fetchBAG, fetchBAGByQuery } from './bag';
import { type BAGLocationExtended } from './bag.types';
import {
  DEFAULT_LAT,
  DEFAULT_LNG,
} from '../../../universal/config/myarea-datasets';
import {
  ApiResponse_DEPRECATED,
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { isMokum } from '../../../universal/helpers/brp';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { fetchBrp } from '../brp/brp';
import { fetchKVK } from '../hr-kvk/hr-kvk';
import { getVestigingBagIds } from '../hr-kvk/hr-kvk-helpers';

async function fetchPrivate(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse_DEPRECATED<BAGLocationExtended[] | null>> {
  const BRP = await fetchBrp(authProfileAndToken);

  if (BRP.status === 'OK') {
    if (isMokum(BRP.content)) {
      const BAGLocation = (await fetchBAG(BRP.content.adres))?.content;

      if (!BAGLocation?.latlng) {
        return apiSuccessResult([
          {
            title: 'Amsterdam centrum',
            latlng: {
              lat: DEFAULT_LAT,
              lng: DEFAULT_LNG,
            },
            address: null,
            bagAddress: null,
            mokum: true,
            profileType: 'private',
          },
        ]);
      }
      return apiSuccessResult([
        Object.assign(BAGLocation, { profileType: 'private', title: 'Thuis' }),
      ]);
    }

    return apiSuccessResult([
      {
        title: 'Nergens',
        latlng: null,
        address: null,
        bagAddress: null,
        mokum: false,
        profileType: 'private',
      },
    ]);
  }

  return apiDependencyError({ BRP });
}

async function fetchCommercial(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse_DEPRECATED<BAGLocationExtended[] | null>> {
  const KVK = await fetchKVK(authProfileAndToken);

  if (KVK.status === 'OK') {
    const vestigingen = getVestigingBagIds(KVK.content);

    const locations = await Promise.all(
      vestigingen
        .map((vestiging) =>
          vestiging.bagIds.map((id) =>
            fetchBAGByQuery({ identificatie: id }).then((res) => {
              return res.content
                ? {
                    ...res.content,
                    profileType: 'commercial' as ProfileType,
                    title: vestiging.naam,
                  }
                : null;
            })
          )
        )
        .flat()
    );

    return apiSuccessResult(locations.filter((location) => location !== null));
  }

  return apiDependencyError({ KVK });
}

export async function fetchMyLocations(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse_DEPRECATED<BAGLocationExtended[] | null>> {
  const commercialResponse = await fetchCommercial(authProfileAndToken);

  if (authProfileAndToken.profile.profileType === 'commercial') {
    return commercialResponse;
  }

  const privateResponse = await fetchPrivate(authProfileAndToken);

  const locations: BAGLocationExtended[] = [
    ...(privateResponse.content || []),
    ...(commercialResponse.content || []),
  ].filter((location) => location !== null);

  return apiSuccessResult(locations);
}

export const forTesting = {
  fetchPrivate,
  fetchCommercial,
};
