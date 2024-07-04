import { AppRoutes, FeatureToggle } from '../../universal/config';
import { apiDependencyError, apiSuccessResult } from '../../universal/helpers';
import { CaseType } from '../../universal/types/vergunningen';
import { AuthProfileAndToken } from '../helpers/app';
import {
  fetchVergunningen,
  getVergunningNotifications,
  HorecaVergunningen,
  horecaVergunningTypes,
  Vergunning,
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
  requestID: requestID,
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
  requestID: requestID,
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
