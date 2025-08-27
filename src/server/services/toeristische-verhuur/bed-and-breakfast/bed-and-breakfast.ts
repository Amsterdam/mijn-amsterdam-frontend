import { BBVergunningFrontend } from './bed-and-breakfast-types';
import { powerBrowserZaakTransformers } from './powerbrowser-zaken';
import {
  ApiResponse_DEPRECATED,
  apiSuccessResult,
} from '../../../../universal/helpers/api';
import { AuthProfile } from '../../../auth/auth-types';
import { fetchZaken } from '../../powerbrowser/powerbrowser-service';

export async function fetchBedAndBreakfast(
  authProfile: AuthProfile
): Promise<ApiResponse_DEPRECATED<BBVergunningFrontend[] | null>> {
  const response = await fetchZaken(authProfile, powerBrowserZaakTransformers);
  return apiSuccessResult([]);
}
