import type { WonenDataFrontend } from './wonen.types.ts';
import { fetchVVEData } from './zwd.ts';
import {
  apiSuccessResult,
  getFailedDependencies,
  type ApiResponse,
} from '../../../universal/helpers/api.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';

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
