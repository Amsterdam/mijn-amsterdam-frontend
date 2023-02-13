import { AppRoutes, FeatureToggle } from '../../universal/config';
import { apiSuccessResult, getSettledResult } from '../../universal/helpers';
import { CaseType } from '../../universal/types/vergunningen';
import { AuthProfileAndToken } from '../helpers/app';
import {
  fetchVergunningen,
  horecaVergunningTypes,
  Vergunning,
} from './vergunningen/vergunningen';

export async function fetchHorecaVergunningen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  profileType: ProfileType = 'private'
) {
  if (!FeatureToggle.horecaActive) {
    return apiSuccessResult({
      vergunningen: [],
    });
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

  return apiSuccessResult({
    vergunningen: [],
  });
}
