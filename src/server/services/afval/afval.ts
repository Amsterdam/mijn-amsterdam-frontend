import {
  apiDependencyError,
  apiSuccessResult,
} from '../../../universal/helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchMyLocation } from '../home';
import { fetchAfvalwijzer } from './afvalwijzer';
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
    const bagID = MY_LOCATION.content?.[0]?.bagNummeraanduidingId;

    console.log('address.address.address', bagID);

    if (!bagID) {
      return apiSuccessResult([]);
    }

    return await fetchAfvalwijzer(requestID, bagID);
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
