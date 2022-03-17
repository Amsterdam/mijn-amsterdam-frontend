import * as Sentry from '@sentry/react';
import { generatePath } from 'react-router-dom';
import { AppRoutes, Chapters } from '../../../universal/config';
import {
  ApiResponse,
  ApiSuccessResponse,
  apiSuccessResult,
  getFailedDependencies,
  getSettledResult,
} from '../../../universal/helpers';
import { MyNotification } from '../../../universal/types';
import { getApiConfig, SourceApiKey } from '../../config';
import { requestData } from '../../helpers';
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
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
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
    sessionID,
    passthroughRequestHeaders
  );

  if (response.status === 'OK') {
    // Filter the response at the end, this way we can use the requestData caching. For example Stadspas and Bijstandsuitkering aanvragen are combined in one api response.
    // In the BFF we want to organize this data into 2 streams (stadspas/aanvraag and bijstand/aanvraag) beloning to 2 separate themse in the front-end.
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
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const filterResponse: FilterResponse = (response) =>
    response.content
      ?.filter(
        (requestProcess) => requestProcess?.about === 'Bijstandsuitkering'
      )
      .map((requestProcess) => addLink(requestProcess));

  const response = await fetchRequestProcess(
    sessionID,
    passthroughRequestHeaders,
    () => bijstandsuitkeringRequestProcessLabels,
    {
      apiConfigName: 'WPI_AANVRAGEN',
      filterResponse,
      requestCacheKey: 'fetch-aanvragen-' + sessionID,
    }
  );

  return response;
}

type StadspasResponseDataTransformed = Partial<WpiStadspasResponseData> & {
  aanvragen: WpiRequestProcess[];
};

export async function fetchStadspas(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
): Promise<ApiSuccessResponse<StadspasResponseDataTransformed>> {
  const filterResponse: FilterResponse = (response) => {
    return response?.content
      ?.filter((requestProcess) => requestProcess?.about === 'Stadspas')
      .map((requestProcess) => addLink(requestProcess));
  };

  const aanvragenRequest = fetchRequestProcess(
    sessionID,
    passthroughRequestHeaders,
    () => stadspasRequestProcessLabels,
    {
      apiConfigName: 'WPI_AANVRAGEN',
      filterResponse,
      requestCacheKey: 'fetch-aanvragen-' + sessionID,
    }
  );

  const stadspasRequest = requestData<WpiStadspasResponseData>(
    getApiConfig('WPI_STADSPAS', {
      transformResponse: (
        response: ApiSuccessResponse<WpiStadspasResponseData>
      ) => {
        return response.content;
      },
    }),
    sessionID,
    passthroughRequestHeaders
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
      ownerType: stadspasResult.content?.ownerType,
      adminNumber: stadspasResult.content?.adminNumber,
    },
    getFailedDependencies({
      aanvragen: aanvragenResult,
      stadspas: stadspasResult,
    })
  );
}

export async function fetchEAanvragen(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  about?: string[]
) {
  const filterResponse: FilterResponse = (response) => {
    return response.content.map((requestProcess) => addLink(requestProcess));
  };

  const response = await fetchRequestProcess(
    sessionID,
    passthroughRequestHeaders,
    getEAanvraagRequestProcessLabels,
    {
      apiConfigName: 'WPI_E_AANVRAGEN',
      filterResponse,
      requestCacheKey: 'fetch-e-aanvragen-' + sessionID,
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
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return fetchEAanvragen(sessionID, passthroughRequestHeaders, [
    'Tozo 1',
    'Tozo 2',
    'Tozo 3',
    'Tozo 4',
    'Tozo 5',
  ]);
}

export async function fetchBbz(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return fetchEAanvragen(sessionID, passthroughRequestHeaders, ['Bbz']);
}

export async function fetchTonk(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return fetchEAanvragen(sessionID, passthroughRequestHeaders, ['TONK']);
}

export function transformIncomSpecificationResponse(
  response: ApiSuccessResponse<WpiIncomeSpecificationResponseData>
) {
  return {
    jaaropgaven: response.content.jaaropgaven.map(
      transformIncomeSpecificationItem
    ),
    uitkeringsspecificaties: response.content.uitkeringsspecificaties.map(
      transformIncomeSpecificationItem
    ),
  };
}

export function fetchSpecificaties(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const response = requestData<WpiIncomeSpecificationResponseDataTransformed>(
    getApiConfig('WPI_SPECIFICATIES', {
      transformResponse: transformIncomSpecificationResponse,
    }),
    sessionID,
    passthroughRequestHeaders
  );

  return response;
}

export async function fetchWpiNotifications(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  let notifications: MyNotification[] = [];

  // Stadspas
  {
    const { status, content } = await fetchStadspas(
      sessionID,
      passthroughRequestHeaders
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
      if (content.ownerType && content.stadspassen?.length) {
        const budgetNotifications = getStadspasBudgetNotifications(
          content.ownerType,
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
      sessionID,
      passthroughRequestHeaders
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
      sessionID,
      passthroughRequestHeaders
    );

    if (status === 'OK') {
      if (content?.length) {
        const eAanvraagNotifications = content.flatMap((requestProcess) => {
          const labels = getEAanvraagRequestProcessLabels(requestProcess);

          if (labels) {
            const notification = createProcessNotification(
              requestProcess,
              labels,
              Chapters.INKOMEN
            );

            return [notification];
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
      sessionID,
      passthroughRequestHeaders
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
