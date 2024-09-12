import { FeatureToggle } from '../../universal/config/feature-toggles';
import { AppRoutes } from '../../universal/config/routes';
import {
  apiDependencyError,
  apiSuccessResult,
} from '../../universal/helpers/api';
import { CaseType } from '../../universal/types/vergunningen';
import { AuthProfileAndToken } from '../helpers/app';
import {
  HorecaVergunningen,
  Vergunning,
  fetchVergunningen,
  getVergunningNotifications,
  horecaVergunningTypes,
} from './vergunningen/vergunningen';

export const horecaOptions = {
  appRoute: (vergunning: Vergunning) => {
    switch (vergunning.caseType) {
      case CaseType.ExploitatieHorecabedrijf:
        return AppRoutes['HORECA/DETAIL'];
      default:
        return AppRoutes.HORECA;
    }
  },
  filter: (vergunning: Vergunning) =>
    horecaVergunningTypes.includes(vergunning.caseType),
};

export async function fetchHorecaVergunningen(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  if (!FeatureToggle.horecaActive) {
    return apiSuccessResult([]);
  }

  const vergunningenResponse = await fetchVergunningen(
    requestID,
    authProfileAndToken,
    horecaOptions
  );

  return apiSuccessResult(vergunningenResponse.content as HorecaVergunningen[]);
}

export async function fetchHorecaNotifications(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  compareDate?: Date
) {
  if (!FeatureToggle.horecaActive) {
    return apiSuccessResult({
      notifications: [],
    });
  }

  const VERGUNNINGEN = await fetchVergunningen(
    requestID,
    authProfileAndToken,
    horecaOptions
  );

  if (VERGUNNINGEN.status === 'OK') {
    const notifications = getVergunningNotifications(
      VERGUNNINGEN.content ?? [],
      compareDate
    );

    return apiSuccessResult({
      notifications,
    });
  }

  return apiDependencyError({ VERGUNNINGEN });
}
