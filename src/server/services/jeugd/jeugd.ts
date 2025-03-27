import { ApiResponse, apiSuccessResult } from '../../../universal/helpers/api';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { fetchAanvragen } from '../zorgned/zorgned-service';

export async function fetchJeugd(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiResponse<{ isKnown: boolean }>> {
  console.log('START LLV REQUEST\n========================');
  const aanvragenResponse = await fetchAanvragen(
    requestID,
    authProfileAndToken,
    {
      zorgnedApiConfigKey: 'ZORGNED_LEERLINGENVERVOER',
    }
  );
  console.log('RESPONSE\n==============');
  console.log(JSON.stringify(aanvragenResponse, null, 2));
  console.log('========================\nEND LLV REQUEST');

  if (aanvragenResponse.status !== 'OK') {
    return apiSuccessResult({ isKnown: false });
  }

  return apiSuccessResult({ isKnown: true });
}
