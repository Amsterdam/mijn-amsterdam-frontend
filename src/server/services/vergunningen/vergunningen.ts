import createDebugger from 'debug';
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

const debug = createDebugger('vergunningen');

function transformVergunningFrontend(
  sessionID: SessionID,
  zaak: DecosVergunning,
  detailPageRoute: string
) {
  const zaakFrontend = transformDecosZaakFrontend<DecosVergunning>(
    sessionID,
    zaak,
    {
      detailPageRoute,
      includeFetchDocumentsUrl: true,
      getStepsFN: getStatusSteps,
    }
  );

  return zaakFrontend;
}

async function fetchVergunningen_(
  authProfileAndToken: AuthProfileAndToken,
  appRouteDetailPage: string = routeConfig.detailPage.path
): Promise<ApiResponse<VergunningFrontend[]>> {
  const response = await fetchDecosZaken(
    authProfileAndToken,
    decosZaakTransformers
  );

  debug(response, 'fetchVergunningen_');

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
