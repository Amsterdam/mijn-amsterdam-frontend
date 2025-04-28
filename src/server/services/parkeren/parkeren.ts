import { FeatureToggle } from '../../../universal/config/feature-toggles';
import {
  apiSuccessResult,
  getFailedDependencies,
} from '../../../universal/helpers/api';
import { isMokum } from '../../../universal/helpers/brp';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { getFromEnv } from '../../helpers/env';
import { fetchBRP } from '../profile/brp';
import { fetchDecosParkeerVergunningen } from './parkeren-decos-service';
import {
  hasPermitsOrPermitRequests,
  fetchSSOURL,
} from './parkeren-egis-service';

export async function fetchParkeren(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const brpData = await fetchBRP(requestID, authProfileAndToken);
  const livesOutsideAmsterdam = !isMokum(brpData?.content);
  const isProfileTypePrivate =
    authProfileAndToken.profile.profileType === 'private';

  const shouldCheckForPermitsOrPermitRequests =
    isProfileTypePrivate &&
    livesOutsideAmsterdam &&
    FeatureToggle.parkerenCheckForProductAndPermitsActive;

  let isKnown = true;

  if (shouldCheckForPermitsOrPermitRequests) {
    isKnown = await hasPermitsOrPermitRequests(requestID, authProfileAndToken);
  }

  const url = await fetchSSOURL(requestID, authProfileAndToken);

  const decosParkeerVergunningenResponse = await fetchDecosParkeerVergunningen(
    requestID,
    authProfileAndToken
  );

  return apiSuccessResult(
    {
      isKnown,
      url: url ?? getFromEnv('BFF_PARKEREN_PORTAAL_URL'),
      vergunningen:
        decosParkeerVergunningenResponse.status === 'OK'
          ? decosParkeerVergunningenResponse.content
          : [],
    },
    getFailedDependencies({ vergunningen: decosParkeerVergunningenResponse })
  );
}
