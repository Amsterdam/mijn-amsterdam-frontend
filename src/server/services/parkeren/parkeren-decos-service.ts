import { ParkeerVergunningFrontend } from './config-and-types';
import {
  decosCaseToZaakTransformers,
  decosZaakTransformers,
} from './decos-zaken';
import { routeConfig } from '../../../client/pages/Thema/Parkeren/Parkeren-thema-config';
import { ApiResponse, apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DecosZaakTransformer } from '../decos/config-and-types';
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
      (zaak) => {
        // TODO: Fix this <any>. DecosZaakTransformer<GPP | GPK | ...> is not the same as DecosZaakTransformer<GPP> | DecosZaakTransformer<GPK> | DecosZaakTransformer<...>
        const zaakTransformer: DecosZaakTransformer<any> =
          decosCaseToZaakTransformers[zaak.caseType];

        const zaakTransformed = transformDecosZaakFrontend(
          authProfileAndToken.profile.sid,
          zaak,
          {
            appRoute: routeConfig.detailPage.path,
            includeFetchDocumentsUrl: true,
          }
        );

        const steps = getStatusSteps(zaakTransformed, zaakTransformer);
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
