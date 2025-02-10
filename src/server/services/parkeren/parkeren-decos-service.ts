import { ParkeerVergunningFrontend } from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import { AppRoutes } from '../../../universal/config/routes';
import { ApiResponse, apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service';
import { getStatusSteps } from '../vergunningen/vergunningen-status-steps';

export async function fetchDecosParkeerVergunningen(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<ParkeerVergunningFrontend[]>> {
  const response = await fetchDecosZaken(
    requestID,
    authProfileAndToken,
    decosZaakTransformers
  );

  if (response.status === 'OK') {
    const decosVergunningen = response.content;
    const vergunningenFrontend: ParkeerVergunningFrontend[] =
      decosVergunningen.map((vergunning) => {
        const vergunningTransformed = transformDecosZaakFrontend(
          authProfileAndToken.profile.sid,
          vergunning,
          AppRoutes['PARKEREN/DETAIL']
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
