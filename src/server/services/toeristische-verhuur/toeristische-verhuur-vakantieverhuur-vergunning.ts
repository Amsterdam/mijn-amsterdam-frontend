import {
  VakantieverhuurVergunningFrontend,
  decosZaakTransformers,
  decosZaakTransformersByCaseType,
} from './toeristische-verhuur-config-and-types';
import { routeConfig } from '../../../client/pages/Thema/ToeristischeVerhuur/ToeristischeVerhuur-thema-config';
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
        const zaakTransformer = decosZaakTransformersByCaseType[zaak.caseType];

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
