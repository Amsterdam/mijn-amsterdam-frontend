import { fetchDecosParkeerVergunningen } from './parkeren-decos-service.ts';
import {
  hasPermitsOrPermitRequests,
  fetchSSOURL,
} from './parkeren-egis-service.ts';
import { themaConfig } from '../../../client/apps/bob/pages/Thema/Parkeren/Parkeren-thema-config.ts';
import {
  apiSuccessResult,
  getFailedDependencies,
} from '../../../universal/helpers/api.ts';
import { isMokum } from '../../../universal/helpers/brp.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { getFromEnv } from '../../helpers/env.ts';
import { fetchBrp } from '../brp/brp.ts';

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
    themaConfig.featureToggle.parkerenCheckForProductAndPermitsActive &&
    shouldCheckForPermitsOrPermitRequests;

  let isKnown = true;

  if (shouldCheckForPermitsOrPermitRequests) {
    isKnown = await hasPermitsOrPermitRequests(authProfileAndToken);
  }

  const url = await fetchSSOURL(authProfileAndToken);

  const decosParkeerVergunningenResponse =
    await fetchDecosParkeerVergunningen(authProfileAndToken);

  let filteredParkeerVergunningen;
  if (
    authProfileAndToken.profile.authMethod === 'digidGemachtigd' &&
    decosParkeerVergunningenResponse?.content
  ) {
    const filteredItems = decosParkeerVergunningenResponse.content.filter(
      (item) => item.caseType === 'GPK Machtigen'
    );

    filteredParkeerVergunningen = {
      ...decosParkeerVergunningenResponse,
      content: filteredItems,
    };
  } else {
    filteredParkeerVergunningen = decosParkeerVergunningenResponse;
  }

  return apiSuccessResult(
    {
      isKnown,
      url: url ?? getFromEnv('BFF_PARKEREN_PORTAAL_URL'),
      vergunningen:
        decosParkeerVergunningenResponse.status === 'OK'
          ? filteredParkeerVergunningen.content
          : [],
    },
    getFailedDependencies({ vergunningen: decosParkeerVergunningenResponse })
  );
}
