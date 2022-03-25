import { apiDependencyError } from '../../../universal/helpers';
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
    return await fetchAfvalmomenten(requestID, MY_LOCATION.content?.latlng);
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
    return await fetchAfvalpunten(MY_LOCATION.content?.latlng);
  }
  return apiDependencyError({ MY_LOCATION });
}
