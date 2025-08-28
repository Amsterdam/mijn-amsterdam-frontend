import { fetchBedAndBreakfast } from './bed-and-breakfast/bed-and-breakfast';
import { ToeristischeVerhuur } from './toeristische-verhuur-config-and-types';
import { fetchRegistraties } from './toeristische-verhuur-lvv-registratie';
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

export async function fetchToeristischeVerhuur(
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
      : fetchRegistraties(authProfileAndToken);

  const bbVergunningenRequest = fetchBedAndBreakfast(
    authProfileAndToken.profile
  );

  const vakantieverhuurVergunningenRequest =
    fetchVakantieverhuurVergunningen(authProfileAndToken);

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
      ).sort(dateSort('dateRequest', 'desc')),
      bbVergunningen: (bbVergunningen.content ?? []).sort(
        dateSort('dateRequest', 'desc')
      ),
    },
    failedDependencies
  );
}
