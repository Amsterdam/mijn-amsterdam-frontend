import * as Sentry from '@sentry/react';
import { generatePath } from 'react-router-dom';
import { AppRoutes, Chapters, FeatureToggle } from '../../../universal/config';
import {
  ApiResponse,
  ApiSuccessResponse,
  apiSuccessResult,
  dateSort,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers';
import { MyNotification } from '../../../universal/types';
import { getApiConfig, SourceApiKey } from '../../config';
import { requestData } from '../../helpers';
import { AuthProfileAndToken } from '../../helpers/app';
import {
  getNotifications as getBijstandsuitkeringNotifications,
  requestProcess as bijstandsuitkeringRequestProcessLabels,
} from './content/bijstandsuitkering';
import {
  getNotifications as getSpecificatieNotifications,
  transformIncomeSpecificationItem,
} from './content/specificaties';
import {
  getAanvraagNotifications as getStadspasAanvraagNotifications,
  getBudgetNotifications as getStadspasBudgetNotifications,
  requestProcess as stadspasRequestProcessLabels,
} from './content/stadspas';
import {
  addLink,
  createProcessNotification,
  getEAanvraagRequestProcessLabels,
  isRequestProcessActual,
  transformToStatusLine,
} from './helpers';
import {
  WpiIncomeSpecificationResponseData,
  WpiIncomeSpecificationResponseDataTransformed,
  WpiRequestProcess,
  WpiRequestProcessLabels,
  WpiStadspasResponseData,
} from './wpi-types';

type FilterResponse = (
  response: ApiSuccessResponse<WpiRequestProcess[]>
) => WpiRequestProcess[];

export interface FetchConfig {
  apiConfigName: SourceApiKey;
  filterResponse: FilterResponse;
  requestCacheKey: string;
}

function statusLineTransformer(
  response: WpiRequestProcess[],
  getLabels: (
    requestProcess: WpiRequestProcess
  ) => WpiRequestProcessLabels | undefined
): WpiRequestProcess[] {
  const statusLineRequestProcesses = response?.flatMap((requestProcess) => {
    const labels = getLabels(requestProcess);
    if (labels) {
      return [transformToStatusLine(requestProcess, labels)];
    } else {
      Sentry.captureMessage('Unknown request process labels', {
        extra: {
          about: requestProcess.about,
          title: requestProcess.title,
          status: requestProcess.statusId,
        },
      });
    }
    return [];
  });
  return statusLineRequestProcesses;
}

export async function fetchRequestProcess(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  getLabels: (
    requestProcess: WpiRequestProcess
  ) => WpiRequestProcessLabels | undefined,
  fetchConfig: FetchConfig
): Promise<ApiResponse<WpiRequestProcess[] | null>> {
  const apiConfig = getApiConfig(fetchConfig.apiConfigName, {
    cacheKey: fetchConfig.requestCacheKey,
    transformResponse: [
      (response: ApiSuccessResponse<WpiRequestProcess[]>) => response.content,
    ],
  });

  const response = await requestData<WpiRequestProcess[]>(
    apiConfig,
    requestID,
    authProfileAndToken
  );

  if (response.status === 'OK') {
    // Filter the response at the end, this way we can use the requestData caching. For example Stadspas and Bijstandsuitkering aanvragen are combined in one api response.
    // In the BFF we want to organize this data into 2 streams (stadspas/aanvraag and bijstand/aanvraag) belonging to 2 separate themes in the front-end.
    // Filtering at this point we don't have to call the api 2 separate times because the local memory cache is utilized.
    const responseFiltered = fetchConfig.filterResponse(response);
    const responseTransformed = statusLineTransformer(
      responseFiltered,
      getLabels
    );

    return apiSuccessResult(responseTransformed);
  }

  return response;
}

export async function fetchBijstandsuitkering(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const filterResponse: FilterResponse = (response) =>
    response.content
      ?.filter(
        (requestProcess) => requestProcess?.about === 'Bijstandsuitkering'
      )
      .map((requestProcess) => addLink(requestProcess));

  const response = await fetchRequestProcess(
    requestID,
    authProfileAndToken,
    () => bijstandsuitkeringRequestProcessLabels,
    {
      apiConfigName: 'WPI_AANVRAGEN',
      filterResponse,
      requestCacheKey: 'fetch-aanvragen-' + requestID,
    }
  );

  return response;
}

export type StadspasResponseDataTransformed =
  Partial<WpiStadspasResponseData> & {
    aanvragen: WpiRequestProcess[];
  };

export async function fetchStadspas(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
): Promise<ApiSuccessResponse<StadspasResponseDataTransformed>> {
  const filterResponse: FilterResponse = (response) => {
    return response?.content
      ?.filter((requestProcess) => requestProcess?.about === 'Stadspas')
      .map((requestProcess) => addLink(requestProcess));
  };

  let aanvragenRequest:
    | Promise<ApiResponse<WpiRequestProcess[] | null>>
    | Promise<ApiSuccessResponse<never[]>> = Promise.resolve(
    apiSuccessResult([])
  );

  // Only request aanvragen when toggle is active
  if (FeatureToggle.stadspasRequestsActive) {
    aanvragenRequest = fetchRequestProcess(
      requestID,
      authProfileAndToken,
      () => stadspasRequestProcessLabels,
      {
        apiConfigName: 'WPI_AANVRAGEN',
        filterResponse,
        requestCacheKey: 'fetch-aanvragen-' + requestID,
      }
    );
  }

  const stadspasRequest = requestData<WpiStadspasResponseData>(
    getApiConfig('WPI_STADSPAS', {
      transformResponse: (
        response: ApiSuccessResponse<WpiStadspasResponseData>
      ) => {
        return response.content;
      },
    }),
    requestID,
    authProfileAndToken
  );

  const [aanvragenResponse, stadspasResponse] = await Promise.allSettled([
    aanvragenRequest,
    stadspasRequest,
  ]);

  const stadspasResult = getSettledResult(stadspasResponse);
  const aanvragenResult = getSettledResult(aanvragenResponse);

  const aanvragen = aanvragenResult.content || [];
  const stadspassen = (stadspasResult.content?.stadspassen || []).map(
    (stadspas) => {
      return {
        ...stadspas,
        link: {
          to: generatePath(AppRoutes['STADSPAS/SALDO'], { id: stadspas.id }),
          title: `Stadspas van ${stadspas.owner}`,
        },
      };
    }
  );

  return apiSuccessResult(
    {
      aanvragen,
      stadspassen,
      adminNumber: stadspasResult.content?.adminNumber,
    },
    getFailedDependencies({
      aanvragen: aanvragenResult,
      stadspas: stadspasResult,
    })
  );
}

export async function fetchEAanvragen(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken,
  about?: string[]
) {
  const filterResponse: FilterResponse = (response) => {
    return response.content.map((requestProcess) => addLink(requestProcess));
  };

  const response = await fetchRequestProcess(
    requestID,
    authProfileAndToken,
    getEAanvraagRequestProcessLabels,
    {
      apiConfigName: 'WPI_E_AANVRAGEN',
      filterResponse,
      requestCacheKey: 'fetch-e-aanvragen-' + requestID,
    }
  );

  if (about && response.status === 'OK' && response.content) {
    return apiSuccessResult(
      response.content.filter((requestProcess) =>
        about.includes(requestProcess.about as string)
      )
    );
  }

  return response;
}

export async function fetchTozo(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchEAanvragen(requestID, authProfileAndToken, [
    'Tozo 1',
    'Tozo 2',
    'Tozo 3',
    'Tozo 4',
    'Tozo 5',
  ]);
}

export async function fetchBbz(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const bbz = await fetchEAanvragen(requestID, authProfileAndToken, ['Bbz']);

  return bbz;
}

export async function fetchTonk(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchEAanvragen(requestID, authProfileAndToken, ['TONK']);
}

export function transformIncomSpecificationResponse(
  response: ApiSuccessResponse<WpiIncomeSpecificationResponseData>
) {
  return {
    jaaropgaven:
      response.content?.jaaropgaven
        .map(transformIncomeSpecificationItem)
        .sort(dateSort('datePublished', 'desc')) ?? [],
    uitkeringsspecificaties:
      response.content?.uitkeringsspecificaties
        .map(transformIncomeSpecificationItem)
        .sort(dateSort('datePublished', 'desc')) ?? [],
  };
}

export function fetchSpecificaties(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = requestData<WpiIncomeSpecificationResponseDataTransformed>(
    getApiConfig('WPI_SPECIFICATIES', {
      transformResponse: transformIncomSpecificationResponse,
    }),
    requestID,
    authProfileAndToken
  );

  return response;
}

export async function fetchWpiNotifications(
  requestID: requestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const today = new Date();

  let notifications: MyNotification[] = [];

  // Stadspas
  {
    const { status, content } = await fetchStadspas(
      requestID,
      authProfileAndToken
    );

    if (status === 'OK' && !!content) {
      if (content.aanvragen?.length) {
        const aanvraagNotifications = getStadspasAanvraagNotifications(
          content.aanvragen
        );
        if (aanvraagNotifications) {
          notifications.push(...aanvraagNotifications);
        }
      }
      if (content.stadspassen?.length) {
        const budgetNotifications = getStadspasBudgetNotifications(
          content.stadspassen
        );

        if (budgetNotifications) {
          notifications.push(...budgetNotifications);
        }
      }
    }
  }

  // Bijstandsuitkeringen
  {
    const { status, content } = await fetchBijstandsuitkering(
      requestID,
      authProfileAndToken
    );

    if (status === 'OK') {
      if (content?.length) {
        const aanvraagNotifications =
          getBijstandsuitkeringNotifications(content);
        if (aanvraagNotifications) {
          notifications.push(...aanvraagNotifications);
        }
      }
    }
  }

  // E-Aanvragen
  {
    const { status, content } = await fetchEAanvragen(
      requestID,
      authProfileAndToken
    );

    if (status === 'OK') {
      if (content?.length) {
        const eAanvraagNotifications = content
          ?.filter((requestProcess) => {
            return isRequestProcessActual(requestProcess.datePublished, today);
          })
          .flatMap((requestProcess) => {
            const labels = getEAanvraagRequestProcessLabels(requestProcess);

            if (labels) {
              const notifications = requestProcess.steps.map((step) =>
                createProcessNotification(
                  requestProcess,
                  step,
                  labels,
                  Chapters.INKOMEN
                )
              );
              return notifications;
            }
            return [];
          });

        if (eAanvraagNotifications) {
          notifications.push(...eAanvraagNotifications);
        }
      }
    }
  }

  // Specificaties
  {
    const { status, content } = await fetchSpecificaties(
      requestID,
      authProfileAndToken
    );

    if (status === 'OK') {
      if (content) {
        const specificatieNotifications = getSpecificatieNotifications(content);

        if (specificatieNotifications) {
          notifications.push(...specificatieNotifications);
        }
      }
    }
  }

  return apiSuccessResult({ notifications });
}
