import { fetchDecosParkeerVergunningen } from './parkeren-decos-service';
import {
  hasPermitsOrPermitRequests,
  fetchSSOURL,
} from './parkeren-egis-service';
import { featureToggle } from '../../../client/pages/Thema/Parkeren/Parkeren-thema-config';
import {
  apiSuccessResult,
  getFailedDependencies,
} from '../../../universal/helpers/api';
import { isMokum } from '../../../universal/helpers/brp';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { getFromEnv } from '../../helpers/env';
import { fetchBrp } from '../brp/brp';

export async function fetchParkeren(authProfileAndToken: AuthProfileAndToken) {
  const isProfileTypePrivate =
    authProfileAndToken.profile.profileType === 'private';

  let shouldCheckForPermitsOrPermitRequests;

  if (isProfileTypePrivate) {
    const brpData = await fetchBrp(authProfileAndToken);
    const livesOutsideAmsterdam = !isMokum(brpData?.content);
    shouldCheckForPermitsOrPermitRequests = livesOutsideAmsterdam;
  } else {
    shouldCheckForPermitsOrPermitRequests = true;
  }

  shouldCheckForPermitsOrPermitRequests =
    featureToggle.parkerenCheckForProductAndPermitsActive &&
    shouldCheckForPermitsOrPermitRequests;

  let isKnown = true;

  if (shouldCheckForPermitsOrPermitRequests) {
    isKnown = await hasPermitsOrPermitRequests(authProfileAndToken);
  }

  const url = await fetchSSOURL(authProfileAndToken);

  const decosParkeerVergunningenResponse =
    await fetchDecosParkeerVergunningen(authProfileAndToken);

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
