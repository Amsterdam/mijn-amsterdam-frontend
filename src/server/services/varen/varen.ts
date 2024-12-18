import { FeatureToggle } from '../../../universal/config/feature-toggles';
import {
  apiPostponeResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';

export async function fetchVaren(
  _requestID: RequestID,
  _authProfileAndToken: AuthProfileAndToken
) {
  return FeatureToggle.varenActive
    ? apiSuccessResult([])
    : apiPostponeResult([]);
}
