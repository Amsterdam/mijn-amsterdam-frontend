import memoizee from 'memoizee';

import { DecosVergunning, VergunningFrontend } from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import { getDisplayStatus, getStatusSteps } from './vergunningen-status-steps';
import {
  AppRoutes,
  AppRouteVergunningen,
} from '../../../universal/config/routes';
import { ApiResponse, apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../../config/source-api';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service';

function transformVergunningFrontend(
  sessionID: SessionID,
  vergunning: DecosVergunning,
  appRoute: AppRouteVergunningen
) {
  const vergunningFrontend = transformDecosZaakFrontend<DecosVergunning>(
    sessionID,
    vergunning,
    { appRoute, includeFetchDocumentsUrl: true }
  );

  const steps = getStatusSteps(vergunningFrontend);

  return {
    ...vergunningFrontend,
    steps,
    displayStatus: getDisplayStatus(vergunningFrontend, steps),
  };
}

async function fetchVergunningen_(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  appRoute: AppRouteVergunningen = AppRoutes['VERGUNNINGEN/DETAIL']
): Promise<ApiResponse<VergunningFrontend<DecosVergunning>[]>> {
  const response = await fetchDecosZaken(
    requestID,
    authProfileAndToken,
    decosZaakTransformers
  );

  if (response.status === 'OK') {
    const decosZaken = response.content;
    const zakenFrontend: VergunningFrontend<DecosVergunning>[] = decosZaken.map(
      (vergunning) =>
        transformVergunningFrontend(
          authProfileAndToken.profile.sid,
          vergunning,
          appRoute
        )
    );
    return apiSuccessResult(zakenFrontend);
  }

  return response;
}

export const fetchVergunningen = memoizee(fetchVergunningen_, {
  maxAge: DEFAULT_API_CACHE_TTL_MS,
});

export const forTesting = {
  transformVergunningFrontend,
  fetchVergunningen_,
};
