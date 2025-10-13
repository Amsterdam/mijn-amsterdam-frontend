import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { fetchMyLocation } from '../bag/my-locations';
import { fetchAfvalpuntenByLatLng } from './afvalpunten';
import { fetchAfvalwijzer } from './afvalwijzer';

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
