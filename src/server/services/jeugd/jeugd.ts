import { ApiResponse, apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { fetchAanvragen } from '../zorgned/zorgned-service';

export async function fetchJeugd(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<{ isKnown: boolean }>> {
  const aanvragenResponse = await fetchAanvragen(
    requestID,
    authProfileAndToken,
    {
      zorgnedApiConfigKey: 'ZORGNED_LEERLINGENVERVOER',
    }
  );

  console.log(JSON.stringify(aanvragenResponse, null, 2));

  if (aanvragenResponse.status !== 'OK') {
    return apiSuccessResult({ isKnown: false });
  }

  return apiSuccessResult({ isKnown: true });
}
