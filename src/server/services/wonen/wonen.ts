import {
  type ApiResponse,
  apiSuccessResult,
  getFailedDependencies,
} from '../../../universal/helpers/api.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import type { WonenDataFrontend } from './wonen.types.ts';
import { fetchVVEData } from './zwd.ts';

export async function fetchWonen(
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<WonenDataFrontend>> {
  const vveResponse = await fetchVVEData(authProfileAndToken);

  return apiSuccessResult(
    {
      vve: vveResponse.status === 'OK' ? vveResponse.content : null,
    },
    getFailedDependencies({ vve: vveResponse })
  );
}
