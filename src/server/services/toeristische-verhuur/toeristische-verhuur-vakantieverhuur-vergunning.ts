import {
  VakantieverhuurVergunningFrontend,
  decosZaakTransformers,
} from './toeristische-verhuur-config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service';
import {
  getDisplayStatus,
  getStatusSteps,
} from '../vergunningen/vergunningen-status-steps';

export async function fetchVakantieverhuurVergunningen(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchDecosZaken(
    requestID,
    authProfileAndToken,
    decosZaakTransformers
  );

  if (response.status === 'OK') {
    const decosVergunningen = response.content;
    const vergunningenFrontend: VakantieverhuurVergunningFrontend[] =
      decosVergunningen.map((vergunning) => {
        const vergunningTransformed = transformDecosZaakFrontend(
          authProfileAndToken.profile.sid,
          vergunning,
          {
            appRoute: AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'],
            includeFetchDocumentsUrl: true,
          }
        );

        const steps = getStatusSteps(vergunningTransformed);
        const displayStatus = getDisplayStatus(vergunningTransformed, steps);

        return {
          ...vergunningTransformed,
          steps,
          displayStatus,
        };
      });
    return apiSuccessResult(vergunningenFrontend);
  }

  return response;
}
