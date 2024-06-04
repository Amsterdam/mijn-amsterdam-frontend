import {
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { fetchRegelingen } from './hli-regelingen';
import { fetchStadspas } from './stadspas';

export async function fetchHLI(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const [stadspasResult, regelingenResult] = await Promise.allSettled([
    fetchStadspas(requestID, authProfileAndToken),
    fetchRegelingen(requestID, authProfileAndToken),
  ]);

  const HLIResponseData = {
    regelingen: getSettledResult(regelingenResult),
    stadspas: getSettledResult(stadspasResult),
  };

  return apiSuccessResult(
    HLIResponseData,
    getFailedDependencies(HLIResponseData)
  );
}
