import { AppRoutes, FeatureToggle } from '../../universal/config';
import { apiSuccessResult } from '../../universal/helpers';
import { CaseType } from '../../universal/types/vergunningen';
import { AuthProfileAndToken } from '../helpers/app';
import {
  fetchVergunningen,
  HorecaVergunningen,
  horecaVergunningTypes,
  Vergunning,
} from './vergunningen/vergunningen';

export async function fetchHorecaVergunningen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  profileType: ProfileType = 'private'
) {
  if (!FeatureToggle.horecaActive) {
    return apiSuccessResult([]);
  }

  const vergunningenResponse = await fetchVergunningen(
    requestID,
    authProfileAndToken,
    {
      appRoute: (vergunning: Vergunning) => {
        switch (vergunning.caseType) {
          case CaseType.ExploitatieHorecabedrijf:
            return AppRoutes['HORECA/DETAIL'];
          default:
            return AppRoutes.HORECA;
        }
      },
      filter: (vergunning) =>
        horecaVergunningTypes.includes(vergunning.caseType),
    }
  );

  return apiSuccessResult(vergunningenResponse.content as HorecaVergunningen[]);
}

// TODO: notifications
