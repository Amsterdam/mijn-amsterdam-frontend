import { ParkeerVergunningFrontend } from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import { routeConfig } from '../../../client/pages/Thema/Parkeren/Parkeren-thema-config';
import { ApiResponse, apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service';
import { getStatusStepsDecos } from '../vergunningen/decos-status-steps';

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
            getStepsFN: getStatusStepsDecos,
          }
        );
        return zaakTransformed;
      }
    );

    return apiSuccessResult(zakenFrontend);
  }

  return response;
}
