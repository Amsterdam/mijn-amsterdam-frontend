import {
  VakantieverhuurVergunning,
  VakantieverhuurVergunningaanvraag,
} from './toeristische-verhuur-config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service';
import { getStatusSteps } from '../vergunningen/vergunningen-status-steps';

export async function fetchVakantieverhuurVergunningen(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchDecosZaken(requestID, authProfileAndToken, [
    VakantieverhuurVergunningaanvraag,
  ]);

  if (response.status === 'OK') {
    const decosVergunningen = response.content;
    const vergunningenFrontend: VakantieverhuurVergunning[] =
      decosVergunningen.map((vergunning) => {
        const vergunningTransformed = transformDecosZaakFrontend(
          authProfileAndToken.profile.sid,
          vergunning,
          AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING']
        );

        return {
          ...vergunningTransformed,
          steps: getStatusSteps(vergunningTransformed),
        };
      });
    return apiSuccessResult(vergunningenFrontend);
  }

  return response;
}
