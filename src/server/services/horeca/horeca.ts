import { decosZaakTransformers, HorecaVergunningFrontend } from './decos-zaken.ts';
import {
  featureToggle,
  routeConfig,
  themaId,
  themaTitle,
} from '../../../client/pages/Thema/Horeca/Horeca-thema-config.ts';
import {
  apiSuccessResult,
  apiDependencyError,
  ApiResponse,
} from '../../../universal/helpers/api.ts';
import { AuthProfileAndToken } from '../../auth/auth-types.ts';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service.ts';
import { getVergunningNotifications } from '../vergunningen/vergunningen-notifications.ts';
import { getStatusSteps } from '../vergunningen/vergunningen-status-steps.ts';

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
          detailPageRoute: routeConfig.detailPage.path,
          includeFetchDocumentsUrl: true,
          getStepsFN: getStatusSteps,
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
  if (!featureToggle.horecaActive) {
    return apiSuccessResult({
      notifications: [],
    });
  }

  const horecaResponse = await fetchHorecaVergunningen(
    authProfileAndToken
  );

  if (horecaResponse.status === 'OK') {
    const notifications = getVergunningNotifications(
      horecaResponse.content ?? [],
      themaId,
      themaTitle
    );

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ VERGUNNINGEN: horecaResponse });
}
