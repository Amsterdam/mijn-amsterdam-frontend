import memoizee from 'memoizee';

import { DecosVergunning, VergunningFrontend } from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import { getDisplayStatus, getStatusSteps } from './vergunningen-status-steps';
import { AppRoute, AppRoutes } from '../../../universal/config/routes';
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
  appRoute: AppRoute
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
  appRoute: AppRoute = AppRoutes['VERGUNNINGEN/DETAIL']
): Promise<ApiResponse<VergunningFrontend<DecosVergunning>[]>> {
  const response = await fetchDecosZaken(
    requestID,
    authProfileAndToken,
    decosZaakTransformers
  );

  if (response.status === 'OK') {
    const decosVergunningen = response.content;
    const vergunningenFrontend: VergunningFrontend<DecosVergunning>[] =
      decosVergunningen.map((vergunning) =>
        transformVergunningFrontend(
          authProfileAndToken.profile.sid,
          vergunning,
          appRoute
        )
      );
    return apiSuccessResult(vergunningenFrontend);
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
