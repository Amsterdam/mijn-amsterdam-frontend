import {
  decosZaakTransformers,
  HorecaVergunningFrontend,
} from './config-and-types';
import {
  featureToggle,
  routeConfig,
  themaId,
  themaTitle,
} from '../../../client/pages/Thema/Horeca/Horeca-thema-config';
import {
  apiSuccessResult,
  apiDependencyError,
  ApiResponse,
} from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service';
import { getVergunningNotifications } from '../vergunningen/vergunningen-notifications';
import { getStatusSteps } from '../vergunningen/vergunningen-status-steps';

export async function fetchHorecaVergunningen(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<HorecaVergunningFrontend[]>> {
  const response = await fetchDecosZaken(
    requestID,
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
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  if (!featureToggle.horecaActive) {
    return apiSuccessResult({
      notifications: [],
    });
  }

  const VERGUNNINGEN = await fetchHorecaVergunningen(
    requestID,
    authProfileAndToken
  );

  if (VERGUNNINGEN.status === 'OK') {
    const notifications = getVergunningNotifications(
      VERGUNNINGEN.content ?? [],
      decosZaakTransformers,
      themaId,
      themaTitle
    );

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ VERGUNNINGEN });
}
