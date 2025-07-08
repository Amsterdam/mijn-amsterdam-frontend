import { ParkeerVergunningFrontend } from './config-and-types.ts';
import { decosZaakTransformers } from './decos-zaken.ts';
import { routeConfig } from '../../../client/pages/Thema/Parkeren/Parkeren-thema-config.ts';
import { ApiResponse, apiSuccessResult } from '../../../universal/helpers/api.ts';
import { AuthProfileAndToken } from '../../auth/auth-types.ts';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service.ts';
import { getStatusSteps } from '../vergunningen/vergunningen-status-steps.ts';

export async function fetchDecosParkeerVergunningen(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<ParkeerVergunningFrontend[]>> {
  const response = await fetchDecosZaken(
    authProfileAndToken,
    decosZaakTransformers
  );

  if (response.status === 'OK') {
    const zakenFrontend: ParkeerVergunningFrontend[] = response.content.map(
      (zaak) => {
        const zaakTransformed = transformDecosZaakFrontend(
          authProfileAndToken.profile.sid,
          zaak,
          {
            detailPageRoute: routeConfig.detailPage.path,
            includeFetchDocumentsUrl: true,
            getStepsFN: getStatusSteps,
          }
        );
        return zaakTransformed;
      }
    );

    return apiSuccessResult(zakenFrontend);
  }

  return response;
}
