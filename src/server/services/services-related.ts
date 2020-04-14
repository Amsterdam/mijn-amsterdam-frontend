import { fetchAFVAL, fetchBRP } from './index';
import { ApiUnknownResponse, apiUnknownResult } from '../../universal/helpers';
import { fetchHOME } from './home';

type AFVALResponseData =
  | ResolvedType<ReturnType<typeof fetchAFVAL>>
  | ApiUnknownResponse;

export async function loadServicesRelated(sessionID: SessionID) {
  const BRP = await fetchBRP();
  const HOME = await fetchHOME(sessionID);

  let AFVALresponse: AFVALResponseData = apiUnknownResult(
    'De aanvraag voor AFVAL data kon niet worden gemaakt. HOME locatie data is niet beschikbaar.'
  );

  if (HOME.status === 'success') {
    const AFVAL = await fetchAFVAL(HOME.content.latlng);
    AFVALresponse = AFVAL;
  }

  return {
    BRP,
    HOME,
    AFVAL: AFVALresponse,
  };
}
