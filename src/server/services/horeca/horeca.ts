import { ExploitatieHorecabedrijf, HorecaVergunning } from './config-and-types';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { AppRoutes } from '../../../universal/config/routes';
import { Themas } from '../../../universal/config/thema';
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

export async function fetchHorecaVergunningen(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<HorecaVergunning[]>> {
  const response = await fetchDecosZaken(requestID, authProfileAndToken, [
    ExploitatieHorecabedrijf,
  ]);

  if (response.status === 'OK') {
    const decosVergunningen = response.content;
    const vergunningenFrontend: HorecaVergunning[] = decosVergunningen.map(
      (vergunning) =>
        transformDecosZaakFrontend(
          authProfileAndToken.profile.sid,
          vergunning,
          AppRoutes['HORECA/DETAIL']
        )
    );
    return apiSuccessResult(vergunningenFrontend);
  }

  return response;
}

export async function fetchHorecaNotifications(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  if (!FeatureToggle.horecaActive) {
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
      Themas.HORECA
    );

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ VERGUNNINGEN });
}
