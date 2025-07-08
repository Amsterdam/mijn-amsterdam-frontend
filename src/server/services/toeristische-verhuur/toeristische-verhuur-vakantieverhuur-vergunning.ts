import {
  VakantieverhuurVergunningFrontend,
  decosZaakTransformers,
} from './toeristische-verhuur-config-and-types.ts';
import { routeConfig } from '../../../client/pages/Thema/ToeristischeVerhuur/ToeristischeVerhuur-thema-config.ts';
import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import { AuthProfileAndToken } from '../../auth/auth-types.ts';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service.ts';
import { getStatusSteps } from '../vergunningen/vergunningen-status-steps.ts';

export async function fetchVakantieverhuurVergunningen(
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchDecosZaken(
    authProfileAndToken,
    decosZaakTransformers
  );

  if (response.status === 'OK') {
    const decosZaken = response.content;
    const zakenFrontend: VakantieverhuurVergunningFrontend[] = decosZaken.map(
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
