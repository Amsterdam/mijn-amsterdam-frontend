import { powerBrowserZaakTransformers } from './bed-and-breakfast-pb-zaken';
import { BBVergunningFrontend } from './bed-and-breakfast-types';
import { ApiResponse } from '../../../../universal/helpers/api';
import { AuthProfile } from '../../../auth/auth-types';
import { fetchZaken } from '../../powerbrowser/powerbrowser-service';

export async function fetchBedAndBreakfast(
  authProfile: AuthProfile
): Promise<ApiResponse<BBVergunningFrontend[] | null>> {
  const response = await fetchZaken(authProfile, powerBrowserZaakTransformers);
  return response;
}
