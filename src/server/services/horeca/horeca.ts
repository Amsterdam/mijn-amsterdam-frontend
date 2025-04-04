import {
  decosZaakTransformers,
  decosZaakTransformersByCaseType,
  HorecaVergunningFrontend,
} from './config-and-types';
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
import {
  getDisplayStatus,
  getStatusSteps,
} from '../vergunningen/vergunningen-status-steps';

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
      const zaakTransformer = decosZaakTransformersByCaseType[zaak.caseType];

      const zaakTransformed = transformDecosZaakFrontend(
        authProfileAndToken.profile.sid,
        zaak,
        {
          appRoute: AppRoutes['HORECA/DETAIL'],
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
    });

    return apiSuccessResult(zakenFrontend);
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
      decosZaakTransformers,
      Themas.HORECA
    );

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ VERGUNNINGEN });
}
