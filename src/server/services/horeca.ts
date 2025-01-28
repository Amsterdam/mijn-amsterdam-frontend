import { FeatureToggle } from '../../universal/config/feature-toggles';
import { AppRoutes } from '../../universal/config/routes';
import { Themas } from '../../universal/config/thema';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../universal/helpers/api';
import { CaseTypeV2 } from '../../universal/types/vergunningen';
import { AuthProfileAndToken } from '../auth/auth-types';
import { HorecaVergunning } from './vergunningen-v2/config-and-types';
import { fetchVergunningenV2 } from './vergunningen-v2/vergunningen';
import { getVergunningNotifications } from './vergunningen-v2/vergunningen-notifications';

export const horecaVergunningTypes: HorecaVergunning['caseType'][] = [
  CaseTypeV2.ExploitatieHorecabedrijf,
];

export async function fetchHorecaVergunning(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  if (!FeatureToggle.horecaActive) {
    return apiSuccessResult([]);
  }

  const vergunningenResponse = await fetchVergunningenV2(
    requestID,
    authProfileAndToken,
    AppRoutes['HORECA/DETAIL']
  );

  return apiSuccessResult(vergunningenResponse.content as HorecaVergunning[]);
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

  const VERGUNNINGEN = await fetchVergunningenV2(
    requestID,
    authProfileAndToken,
    AppRoutes['HORECA/DETAIL']
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
