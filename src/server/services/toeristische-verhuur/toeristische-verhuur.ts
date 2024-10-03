import { subMonths } from 'date-fns';
import memoize from 'memoizee';
import { generatePath } from 'react-router-dom';
import { FeatureToggle } from '../../../universal/config/feature-toggles';
import { AppRoutes } from '../../../universal/config/routes';
import { Themas } from '../../../universal/config/thema';
import {
  apiDependencyError,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers/api';
import {
  dateFormat,
  dateSort,
  isDateInPast,
} from '../../../universal/helpers/date';
import { isRecentNotification } from '../../../universal/helpers/utils';
import {
  NOTIFICATION_REMINDER_FROM_MONTHS_NEAR_END,
  isNearEndDate,
} from '../../../universal/helpers/vergunningen';
import { MyNotification } from '../../../universal/types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { DEFAULT_API_CACHE_TTL_MS } from '../../config/source-api';
import {
  LVVRegistratie,
  ToeristischeVerhuurVergunning,
} from './toeristische-verhuur-types';
import { fetchRegistraties } from './tv-lvv-registratie';
import { fetchBBVergunningen } from './tv-powerbrowser-bb-vergunning';
import { fetchVakantieverhuurVergunningen } from './tv-vakantieverhuur-vergunning';

export function hasOtherActualVergunningOfSameType(
  items: ToeristischeVerhuurVergunning[],
  item: ToeristischeVerhuurVergunning,
  dateNow: Date = new Date()
): boolean {
  return items.some(
    (otherVergunning: ToeristischeVerhuurVergunning) =>
      otherVergunning.title === item.title &&
      otherVergunning.zaaknummer !== item.zaaknummer &&
      !!otherVergunning.dateEnd &&
      !isDateInPast(otherVergunning.dateEnd, dateNow)
  );
}

async function fetchAndTransformToeristischeVerhuur(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
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
