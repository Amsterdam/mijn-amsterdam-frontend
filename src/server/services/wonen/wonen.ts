import {
  type ApiResponse,
  apiSuccessResult,
  getFailedDependencies,
} from '../../../universal/helpers/api.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { fetchEnergieLabel } from '../energie-label/energie-label.ts';
import type { WonenDataFrontend } from './wonen.types.ts';
import { fetchVVEData } from './zwd.ts';

export async function fetchWonen(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<WonenDataFrontend>> {
  const vveResponse = await fetchVVEData(authProfileAndToken);
  const energieLabelResponse = await fetchEnergieLabel(authProfileAndToken);

  return apiSuccessResult(
    {
      vve: vveResponse.status === 'OK' ? vveResponse.content : null,
      energieLabel:
        energieLabelResponse.status === 'OK'
          ? energieLabelResponse.content
          : null,
    },
    getFailedDependencies({
      vve: vveResponse,
      energieLabel: energieLabelResponse,
    })
  );
}
