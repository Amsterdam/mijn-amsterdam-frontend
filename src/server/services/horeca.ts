import { FeatureToggle } from '../../universal/config';
import { apiSuccessResult } from '../../universal/helpers';
import { AuthProfileAndToken } from '../helpers/app';

export function fetchHorecaVergunningen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  profileType: ProfileType = 'private'
) {
  if (!FeatureToggle.horecaActive) {
    return apiSuccessResult({
      vergunningen: [],
    });
  }

  return apiSuccessResult({
    vergunningen: [],
  });
}
