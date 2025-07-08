import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api.ts';
import { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { fetchMyLocation } from '../bag/my-locations.ts';
import { fetchAfvalpuntenByLatLng } from './afvalpunten.ts';
import { fetchAfvalwijzer } from './afvalwijzer.ts';

export async function fetchAfval(authProfileAndToken: AuthProfileAndToken) {
  const MY_LOCATION = await fetchMyLocation(authProfileAndToken);

  if (MY_LOCATION.status === 'OK') {
    const primaryLocation = MY_LOCATION.content?.[0];
    const bagID = primaryLocation?.bagNummeraanduidingId ?? null;

    if (!bagID) {
      return apiSuccessResult([]);
    }

    return fetchAfvalwijzer(bagID, primaryLocation!.latlng);
  }

  return apiDependencyError({ MY_LOCATION });
}

export async function fetchAfvalPunten(
  authProfileAndToken: AuthProfileAndToken
) {
  const MY_LOCATION = await fetchMyLocation(authProfileAndToken);

  if (MY_LOCATION.status === 'OK') {
    const primaryLocation = MY_LOCATION.content?.[0]?.latlng;

    if (!primaryLocation) {
      return apiSuccessResult(null);
    }

    return fetchAfvalpuntenByLatLng(primaryLocation);
  }

  return apiDependencyError({ MY_LOCATION });
}
