import { apiSuccessResult } from '../../../universal/helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { HLIRegeling } from './regelingen-types';

export async function fetchRegelingen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const regelingen: HLIRegeling[] = [];
  return apiSuccessResult(regelingen);
}
