import memoize from 'memoizee';

import { DecosVaren, VarenFrontend } from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import { AppRoutes } from '../../../universal/config/routes';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../../config/source-api';
import { fetchDecosZaken } from '../decos/decos-service';
import { transformDecosZaakFrontend } from '../decos/decos-service';

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
        transformDecosZaakFrontend<DecosVaren>(
          authProfileAndToken.profile.sid,
          vergunning,
          AppRoutes['VAREN/DETAIL']
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
