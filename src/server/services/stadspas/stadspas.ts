import { generatePath } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config';
import {
  ApiResponse,
  ApiSuccessResponse,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import { getBudgetNotifications } from './stadspas-content';
import { fetchStadspassen } from './stadspas-gpass-service';
import { Stadspas, StadspasResponseData } from './stadspas-types';

export async function fetchStadspas(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiSuccessResponse<StadspasResponseData>> {
  // TODO: Fix when we can retrieve stadspas aanvragen from Zorgned

  let aanvragenRequest: Promise<ApiSuccessResponse<never[]>> = Promise.resolve(
    apiSuccessResult([])
  );

  const stadspasRequest = fetchStadspassen(requestID, authProfileAndToken);

  const [aanvragenResponse, stadspasResponse] = await Promise.allSettled([
    aanvragenRequest,
    stadspasRequest,
  ]);

  const stadspasResult = getSettledResult(stadspasResponse);
  const aanvragenResult = getSettledResult(aanvragenResponse);

  const aanvragen = aanvragenResult.content ?? [];

  const stadspassen: Stadspas[] =
    stadspasResult.status === 'OK'
      ? stadspasResult.content.stadspassen.map((stadspas) => {
          return {
            ...stadspas,
            link: {
              to: generatePath(AppRoutes['STADSPAS/SALDO'], {
                id: stadspas.id,
              }),
              title: `Stadspas van ${stadspas.owner}`,
            },
          };
        })
      : [];

  return apiSuccessResult(
    {
      aanvragen,
      stadspassen,
      administratienummer: stadspasResult.content?.administratienummer ?? null,
    },
    getFailedDependencies({
      aanvragen: aanvragenResult,
      stadspas: stadspasResult,
    })
  );
}

export async function fetchStadspasNotifications(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const { content } = await fetchStadspas(requestID, authProfileAndToken);

  return Array.isArray(content.stadspassen)
    ? getBudgetNotifications(content.stadspassen)
    : [];
}
