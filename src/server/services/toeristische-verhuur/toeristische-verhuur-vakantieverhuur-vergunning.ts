import {
  VakantieverhuurVergunningFrontend,
  decosZaakTransformers,
} from './toeristische-verhuur-config-and-types';
import { routeConfig } from '../../../client/pages/Thema/ToeristischeVerhuur/ToeristischeVerhuur-thema-config';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service';
import { getStatusStepsDecos } from '../vergunningen/decos-status-steps';

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
