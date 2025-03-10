import memoize from 'memoizee';

import { Varen, VarenFrontend } from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import { getStatusSteps } from './varen-status-steps';
import { AppRoute, AppRoutes } from '../../../universal/config/routes';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../../config/source-api';
import { fetchDecosZaken } from '../decos/decos-service';
import { transformDecosZaakFrontend } from '../decos/decos-service';

function transformVarenFrontend(
  sessionID: SessionID,
  appRoute: AppRoute,
  vergunning: Varen
): VarenFrontend {
  const vergunningFrontend = transformDecosZaakFrontend<Varen>(
    sessionID,
    appRoute,
    vergunning
  );
  // Assign the definitive status steps
  vergunningFrontend.steps = getStatusSteps(vergunningFrontend);

  return vergunningFrontend;
}

export async function fetchVaren_(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = await fetchDecosZaken(
    requestID,
    authProfileAndToken,
    decosZaakTransformers
  );

  if (response.status === 'OK') {
    const decosVergunningen = response.content;
    const varenVergunningFrontend: VarenFrontend[] = decosVergunningen.map(
      (vergunning) =>
        transformVarenFrontend(
          authProfileAndToken.profile.sid,
          AppRoutes['VAREN/DETAIL'],
          vergunning
        )
    );
    return apiSuccessResult(varenVergunningFrontend);
  }

  return response;
}

export const fetchVaren = memoize(fetchVaren_, {
  maxAge: DEFAULT_API_CACHE_TTL_MS,
  normalizer: function (args) {
    return args[0] + JSON.stringify(args[1]);
  },
});
