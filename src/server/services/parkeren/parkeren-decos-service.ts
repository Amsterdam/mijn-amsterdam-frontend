import type { ParkeerVergunningFrontend } from './config-and-types.ts';
import { decosZaakTransformers } from './decos-zaken.ts';
import { themaConfig } from '../../../client/pages/Thema/Parkeren/Parkeren-thema-config.ts';
import type { ApiResponse} from '../../../universal/helpers/api.ts';
import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service.ts';
import { getStatusStepsDecos } from '../vergunningen/decos-status-steps.ts';

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
            detailPageRoute: themaConfig.detailPage.route.path,
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
