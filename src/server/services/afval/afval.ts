import { fetchHOME } from '../home';
import { fetchAfvalmomenten } from './afvalmomenten';
import { fetchAfvalpunten } from './afvalpunten';
import { apiDependencyError } from '../../../universal/helpers';

export async function fetchAFVAL(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  profileType: ProfileType
) {
  const HOME = await fetchHOME(
    sessionID,
    passthroughRequestHeaders,
    profileType
  );

  if (HOME.status === 'OK') {
    return await fetchAfvalmomenten(sessionID, HOME.content?.latlng);
  }
  return apiDependencyError({ HOME });
}

export async function fetchAFVALPUNTEN(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  profileType: ProfileType
) {
  const HOME = await fetchHOME(
    sessionID,
    passthroughRequestHeaders,
    profileType
  );

  if (HOME.status === 'OK') {
    return await fetchAfvalpunten(HOME.content?.latlng);
  }
  return apiDependencyError({ HOME });
}
