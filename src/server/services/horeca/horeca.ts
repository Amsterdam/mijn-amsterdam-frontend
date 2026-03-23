import type { HorecaVergunningFrontend } from './decos-zaken.ts';
import { decosZaakTransformers } from './decos-zaken.ts';
import { themaConfig } from '../../../client/pages/Thema/Horeca/Horeca-thema-config.ts';
import type {
  ApiResponse} from '../../../universal/helpers/api.ts';
import {
  apiSuccessResult,
  apiDependencyError
} from '../../../universal/helpers/api.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service.ts';
import { getStatusStepsDecos } from '../vergunningen/decos-status-steps.ts';
import { getVergunningNotifications } from '../vergunningen/vergunningen-notifications.ts';

export async function fetchHorecaVergunningen(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<HorecaVergunningFrontend[]>> {
  const response = await fetchDecosZaken(
    authProfileAndToken,
    decosZaakTransformers
  );

  if (response.status === 'OK') {
    const decosZaken = response.content;
    const zakenFrontend: HorecaVergunningFrontend[] = decosZaken.map((zaak) => {
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
    });

    return apiSuccessResult(zakenFrontend);
  }

  return response;
}

export async function fetchHorecaNotifications(
  authProfileAndToken: AuthProfileAndToken
) {
  if (!themaConfig.featureToggle.active) {
    return apiSuccessResult({
      notifications: [],
    });
  }

  const horecaResponse = await fetchHorecaVergunningen(authProfileAndToken);

  if (horecaResponse.status === 'OK') {
    const notifications = getVergunningNotifications(
      horecaResponse.content ?? [],
      themaConfig.id,
      themaConfig.title
    );

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ VERGUNNINGEN: horecaResponse });
}
