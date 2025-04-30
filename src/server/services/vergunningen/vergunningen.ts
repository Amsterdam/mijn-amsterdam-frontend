import memoizee from 'memoizee';

import { DecosVergunning, VergunningFrontend } from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import { getStatusSteps } from './vergunningen-status-steps';
import { routeConfig } from '../../../client/pages/Thema/Vergunningen/Vergunningen-thema-config';
import { ApiResponse, apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../../config/source-api';
import {
  fetchDecosZaken,
  transformDecosZaakFrontend,
} from '../decos/decos-service';

function transformVergunningFrontend(
  sessionID: SessionID,
  zaak: DecosVergunning,
  appRoute: string
) {
  const zaakFrontend = transformDecosZaakFrontend<DecosVergunning>(
    sessionID,
    zaak,
    {
      detailPageRoute: appRoute,
      includeFetchDocumentsUrl: true,
      getStepsFN: getStatusSteps,
    }
  );

  return zaakFrontend;
}

async function fetchVergunningen_(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  appRouteDetailPage: string = routeConfig.detailPage.path
): Promise<ApiResponse<VergunningFrontend[]>> {
  const response = await fetchDecosZaken(
    requestID,
    authProfileAndToken,
    decosZaakTransformers
  );

  if (response.status === 'OK') {
    const decosZaken = response.content;
    const zakenFrontend: VergunningFrontend[] = decosZaken.map((vergunning) =>
      transformVergunningFrontend(
        authProfileAndToken.profile.sid,
        vergunning,
        appRouteDetailPage
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
