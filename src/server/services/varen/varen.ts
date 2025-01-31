import memoize from 'memoizee';

import { Varen, VarenFrontend } from './config-and-types';
import { decosZaakTransformers } from './decos-zaken';
import { AppRoute, AppRoutes } from '../../../universal/config/routes';
import { apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../../config/source-api';
import { fetchDecosZaken } from '../decos/decos-service';
import { transformDecosZaakFrontend } from '../decos/decos-service';
import { DecosZaakTransformer } from '../decos/decos-types';

export async function fetchVaren_(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  appRoute: AppRoute = AppRoutes['VERGUNNINGEN/DETAIL']
) {
  const response = await fetchDecosZaken(
    requestID,
    authProfileAndToken,
    decosZaakTransformers as DecosZaakTransformer<Varen>[]
  );

  if (response.status === 'OK') {
    const decosVergunningen = response.content;
    const varenVergunningFrontend: VarenFrontend[] = decosVergunningen.map(
      (vergunning) =>
        transformDecosZaakFrontend<Varen>(
          authProfileAndToken.profile.sid,
          vergunning,
          appRoute
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
