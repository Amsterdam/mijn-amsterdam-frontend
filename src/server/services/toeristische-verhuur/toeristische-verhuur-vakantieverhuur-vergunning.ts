import {
  VakantieverhuurVergunningFrontend,
  decosZaakTransformers,
  decosZaakTransformersByCaseType,
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
    const decosZaken = response.content;
    const zakenFrontend: VakantieverhuurVergunningFrontend[] = decosZaken.map(
      (zaak) => {
        const zaakTransformer = decosZaakTransformersByCaseType[zaak.caseType];

        const zaakTransformed = transformDecosZaakFrontend(
          authProfileAndToken.profile.sid,
          zaak,
          {
            appRoute: AppRoutes['TOERISTISCHE_VERHUUR/VERGUNNING'],
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
