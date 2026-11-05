import { themaConfig } from '../../../client/apps/bob/pages/Thema/Parkeren/Parkeren-thema-config.ts';
import {
  apiSuccessResult,
  getFailedDependencies,
} from '../../../universal/helpers/api.ts';
import { isMokum } from '../../../universal/helpers/brp.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getFromEnv } from '../../helpers/env.ts';
import { fetchBrp } from '../brp/brp.ts';
import { fetchDecosParkeerVergunningen } from './parkeren-decos-service.ts';
import {
  fetchSSOURL,
  hasPermitsOrPermitRequests,
} from './parkeren-egis-service.ts';

export async function fetchParkeren(authProfileAndToken: AuthProfileAndToken) {
  const isProfileTypePrivate =
    authProfileAndToken.profile.profileType === 'private';

  let shouldCheckForPermitsOrPermitRequests: boolean;

  if (isProfileTypePrivate) {
    const brpData = await fetchBrp(authProfileAndToken);
    const livesInsideAmsterdam = isMokum(brpData?.content);
    shouldCheckForPermitsOrPermitRequests = !livesInsideAmsterdam;
  } else {
    shouldCheckForPermitsOrPermitRequests = true;
  }

  shouldCheckForPermitsOrPermitRequests =
    themaConfig.featureToggle.parkerenCheckForProductAndPermitsActive &&
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
