import { fetchAFVAL, fetchBRP } from './index';
import { ApiUnknownResponse, apiUnknownResult } from '../../universal/helpers';
import { fetchHOME } from './home';

type AFVALResponseData =
  | ResolvedType<ReturnType<typeof fetchAFVAL>>
  | ApiUnknownResponse;

export async function loadServicesRelated(
  sessionID: SessionID,
  samlToken: string
) {
  const BRP = await fetchBRP(sessionID, samlToken);
  const HOME = await fetchHOME(sessionID, samlToken);

  let AFVALresponse: AFVALResponseData = apiUnknownResult(
    'De aanvraag voor AFVAL data kon niet worden gemaakt. HOME locatie data is niet beschikbaar.'
  );

  if (HOME.status === 'OK') {
    const AFVAL = await fetchAFVAL(sessionID, samlToken, HOME.content.latlng);
    AFVALresponse = AFVAL;
  }

  return {
    BRP,
    HOME,
    AFVAL: AFVALresponse,
  };
}
