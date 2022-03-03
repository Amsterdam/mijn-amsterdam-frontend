import { generatePath } from 'react-router-dom';
import { AppRoutes, Chapters } from '../../../universal/config';
import {
  apiSuccesResult,
  ApiSuccessResponse,
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

type FilterResponse<R extends WpiRequestProcess[] = WpiRequestProcess[]> = (
  response: ApiSuccessResponse<R>
) => R;

export interface FetchConfig {
  apiConfigName: SourceApiKey;
  filterResponse: FilterResponse<any>;
  requestCacheKey: string;
}

export async function fetchRequestProcess<R extends WpiRequestProcess>(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  getLabels: (
    requestProcess: WpiRequestProcess
  ) => WpiRequestProcessLabels | undefined,
  fetchConfig: FetchConfig
) {
  const statusLineTransformer = (response: R[]) =>
    response?.flatMap((requestProcess) => {
      const labels = getLabels(requestProcess);
      if (labels) {
        return [transformToStatusLine(requestProcess, labels)];
      } else {
        // Log Unknown Process
      }
      return [];
    });

  const apiConfig = getApiConfig(fetchConfig.apiConfigName, {
    cacheKey: fetchConfig.requestCacheKey,
    transformResponse: [fetchConfig.filterResponse, statusLineTransformer],
  });

  const response = requestData<WpiRequestProcess[]>(
    apiConfig,
    sessionID,
    passthroughRequestHeaders
  );

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
      requestCacheKey: 'fetch-aanvragen-bijstandsuitkering-' + sessionID,
    }
  );

  return response;
}

export async function fetchStadspas(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
): Promise<
  ApiSuccessResponse<
    Partial<WpiStadspasResponseData> & { aanvragen?: WpiRequestProcess[] }
  >
> {
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
      requestCacheKey: 'fetch-aanvragen-stadspas-' + sessionID,
    }
  );

  const stadspasRequest = requestData<WpiStadspasResponseData>(
    getApiConfig('WPI_STADSPAS', {
      transformResponse: (response: ApiSuccessResponse<any>) =>
        response.content,
    }),
    sessionID,
    passthroughRequestHeaders
  );

  const [aanvragenResponse, stadspasResponse] = await Promise.allSettled([
    aanvragenRequest,
    stadspasRequest,
  ]);

  const stadspas = getSettledResult(stadspasResponse);
  const aanvragen = getSettledResult(aanvragenResponse);

  return apiSuccesResult(
    {
      aanvragen: aanvragen.content || [],
      stadspassen: (stadspas.content?.stadspassen || []).map((stadspas) => {
        return {
          ...stadspas,
          link: {
            to: generatePath(AppRoutes['STADSPAS/SALDO'], { id: stadspas.id }),
            title: `Stadspas van ${stadspas.owner}`,
          },
        };
      }),
      ownerType: stadspas.content?.ownerType,
      adminNumber: stadspas.content?.adminNumber,
    },
    getFailedDependencies({ aanvragen, stadspas })
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

  if (about && response.status === 'OK') {
    return apiSuccesResult(
      response.content.filter((requestProcess) =>
        about.includes(requestProcess.about)
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
  return apiSuccesResult({ notifications });
}
