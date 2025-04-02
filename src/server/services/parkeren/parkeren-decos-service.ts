import { ParkeerVergunningFrontend } from './config-and-types';
import {
  decosCaseToZaakTransformers,
  decosZaakTransformers,
} from './decos-zaken';
import { AppRoutes } from '../../../universal/config/routes';
import { ApiResponse, apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service';
import {
  getDisplayStatus,
  getStatusSteps,
} from '../vergunningen/vergunningen-status-steps';

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
    const decosZaken = response.content;

    const zakenFrontend: ParkeerVergunningFrontend[] = decosZaken.map(
      (vergunning) => {
        const zaakTransformer =
          decosCaseToZaakTransformers[vergunning.caseType];

        const zaakTransformed = transformDecosZaakFrontend(
          authProfileAndToken.profile.sid,
          vergunning,
          {
            appRoute: AppRoutes['PARKEREN/DETAIL'],
            includeFetchDocumentsUrl: true,
          }
        );

        const steps = getStatusSteps(zaakTransformed, zaakTransformer as any);
        const displayStatus = getDisplayStatus(zaakTransformed, steps);

        return {
          ...zaakTransformed,
          steps,
          displayStatus,
        };
      }
    );

    return apiSuccessResult(zakenFrontend);
  }

  return response;
}
