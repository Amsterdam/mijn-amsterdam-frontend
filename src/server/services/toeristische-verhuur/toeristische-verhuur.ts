import memoize from 'memoizee';

import { ToeristischeVerhuur } from './toeristische-verhuur-config-and-types';
import { fetchRegistraties } from './toeristische-verhuur-lvv-registratie';
import { fetchBBVergunningen } from './toeristische-verhuur-powerbrowser-bb-vergunning';
import { fetchVakantieverhuurVergunningen } from './toeristische-verhuur-vakantieverhuur-vergunning';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import {
  ApiSuccessResponse,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers/api';
import { dateSort } from '../../../universal/helpers/date';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../../config/source-api';

async function fetchAndTransformToeristischeVerhuur(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiSuccessResponse<ToeristischeVerhuur>> {
  if (!FeatureToggle.toeristischeVerhuurActive) {
    return apiSuccessResult({
      vakantieverhuurVergunningen: [],
      bbVergunningen: [],
      lvvRegistraties: [],
    });
  }

  const lvvRegistratiesRequest =
    authProfileAndToken.profile.profileType === 'commercial'
      ? Promise.resolve(apiSuccessResult([]))
      : fetchRegistraties(requestID, authProfileAndToken);

  const bbVergunningenRequest = fetchBBVergunningen(
    requestID,
    authProfileAndToken.profile
  );

  const vakantieverhuurVergunningenRequest = fetchVakantieverhuurVergunningen(
    requestID,
    authProfileAndToken
  );

  const [
    lvvRegistratiesResponse,
    vakantieverhuurVergunningenResponse,
    bbVergunningenResponse,
  ] = await Promise.allSettled([
    lvvRegistratiesRequest,
    vakantieverhuurVergunningenRequest,
    bbVergunningenRequest,
  ]);

  const lvvRegistraties = getSettledResult(lvvRegistratiesResponse);

  const vakantieverhuurVergunningen = getSettledResult(
    vakantieverhuurVergunningenResponse
  );

  const bbVergunningen = getSettledResult(bbVergunningenResponse);

  const failedDependencies = getFailedDependencies({
    lvvRegistraties,
    vakantieverhuurVergunningen,
    bbVergunningen,
  });

  return apiSuccessResult(
    {
      lvvRegistraties: (lvvRegistraties.content ?? []).sort(
        dateSort('agreementDate', 'desc')
      ),
      vakantieverhuurVergunningen: (
        vakantieverhuurVergunningen.content ?? []
      ).sort(dateSort('dateReceived', 'desc')),
      bbVergunningen: (bbVergunningen.content ?? []).sort(
        dateSort('dateReceived', 'desc')
      ),
    },
    failedDependencies
  );
}

export const fetchToeristischeVerhuur = memoize(
  fetchAndTransformToeristischeVerhuur,
  {
    maxAge: DEFAULT_API_CACHE_TTL_MS,
    normalizer: function (args) {
      return args[0] + JSON.stringify(args[1]);
    },
  }
);
