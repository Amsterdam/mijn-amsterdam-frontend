import { fetchMyLocation } from '../home';
import { fetchAfvalmomenten } from './afvalmomenten';
import { fetchAfvalpunten } from './afvalpunten';
import { apiDependencyError } from '../../../universal/helpers';

export async function fetchAFVAL(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  profileType: ProfileType
) {
  const MY_LOCATION = await fetchMyLocation(
    sessionID,
    passthroughRequestHeaders,
    profileType
  );

  if (MY_LOCATION.status === 'OK') {
    return await fetchAfvalmomenten(sessionID, MY_LOCATION.content?.latlng);
  }
  return apiDependencyError({ MY_LOCATION });
}

export async function fetchAFVALPUNTEN(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  profileType: ProfileType
) {
  const MY_LOCATION = await fetchMyLocation(
    sessionID,
    passthroughRequestHeaders,
    profileType
  );

  if (MY_LOCATION.status === 'OK') {
    return await fetchAfvalpunten(MY_LOCATION.content?.latlng);
  }
  return apiDependencyError({ MY_LOCATION });
}
