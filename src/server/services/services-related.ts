import { fetchAFVAL, fetchBRP } from './index';
import {
  ApiDependencyErrorResponse,
  apiDependencyError,
} from '../../universal/helpers';
import { fetchHOME } from './home';

type AFVALResponseData =
  | ResolvedType<ReturnType<typeof fetchAFVAL>>
  | ApiDependencyErrorResponse;

export async function loadServicesRelated(
  sessionID: SessionID,
  samlToken: string
) {
  const BRP = await fetchBRP(sessionID, samlToken);
  const HOME = await fetchHOME(sessionID, samlToken);

  let AFVAL: AFVALResponseData;

  if (HOME.status === 'OK') {
    AFVAL = await fetchAFVAL(sessionID, samlToken, HOME.content.latlng);
  } else {
    AFVAL = apiDependencyError({ BRP, HOME });
  }

  return {
    BRP,
    HOME,
    AFVAL,
  };
}
