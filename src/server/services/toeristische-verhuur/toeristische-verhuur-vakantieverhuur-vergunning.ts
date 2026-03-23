import { decosZaakTransformers } from './toeristische-verhuur-service-config.ts';
import type { VakantieverhuurVergunningFrontend } from './toeristische-verhuur.types.ts';
import { themaConfig } from '../../../client/pages/Thema/ToeristischeVerhuur/ToeristischeVerhuur-thema-config.ts';
import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service.ts';
import { getStatusStepsDecos } from '../vergunningen/decos-status-steps.ts';

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
