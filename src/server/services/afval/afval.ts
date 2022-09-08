import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchMyLocation } from '../home';
import { fetchAfvalmomenten } from './afvalmomenten';
import { fetchAfvalpunten } from './afvalpunten';

export async function fetchAFVAL(
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
      return apiSuccessResult([]);
    }

    return await fetchAfvalmomenten(requestID, primaryLocation);
  }

  return apiDependencyError({ MY_LOCATION });
}

export async function fetchAFVALPUNTEN(
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
