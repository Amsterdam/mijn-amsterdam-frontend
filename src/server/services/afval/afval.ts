import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchMyLocation } from '../home';
import { fetchAfvalwijzer } from './afvalwijzer';
import { fetchAfvalpunten } from './afvalpunten';

export async function fetchAfval(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  profileType: ProfileType
) {
  const MY_LOCATION = await fetchMyLocation(
    requestID,
    authProfileAndToken,
    profileType
  );

  if (MY_LOCATION.status === 'OK') {
    const primaryLocation = MY_LOCATION.content?.[0];
    const bagID = primaryLocation?.bagNummeraanduidingId ?? null;

    if (!bagID) {
      return apiSuccessResult([]);
    }

    return await fetchAfvalwijzer(requestID, bagID, primaryLocation!.latlng);
  }

  return apiDependencyError({ MY_LOCATION });
}

export async function fetchAfvalPunten(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  profileType: ProfileType
) {
  const MY_LOCATION = await fetchMyLocation(
    requestID,
    authProfileAndToken,
    profileType
  );

  if (MY_LOCATION.status === 'OK') {
    const primaryLocation = MY_LOCATION.content?.[0]?.latlng;

    if (!primaryLocation) {
      return apiSuccessResult(null);
    }

    return await fetchAfvalpunten(primaryLocation);
  }

  return apiDependencyError({ MY_LOCATION });
}
