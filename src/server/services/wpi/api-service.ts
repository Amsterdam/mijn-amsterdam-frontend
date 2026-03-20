import type {
  ApiResponse,
  ApiResponse_DEPRECATED,
} from '../../../universal/helpers/api.ts';
import { apiSuccessResult } from '../../../universal/helpers/api.ts';
import { dateSort } from '../../../universal/helpers/date.ts';
import { pick } from '../../../universal/helpers/utils.ts';
import type { MyNotification } from '../../../universal/types/App.types.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import type { SourceApiName } from '../../config/source-api.ts';
import { getFromEnv } from '../../helpers/env.ts';
import {
  createSessionBasedCacheKey,
  getApiConfig,
} from '../../helpers/source-api-helpers.ts';
import { requestData } from '../../helpers/source-api-request.ts';
import { captureMessage } from '../monitoring.ts';
import type { DocumentDownloadData } from '../shared/document-download-route-handler.ts';
import { DEFAULT_DOCUMENT_DOWNLOAD_MIME_TYPE } from '../shared/document-download-route-handler.ts';
import {
  requestProcess as bijstandsuitkeringRequestProcessLabels,
  getNotifications as getBijstandsuitkeringNotifications,
} from './content/bijstandsuitkering.ts';
import {
  getNotifications as getSpecificatieNotifications,
  transformIncomeSpecificationItem,
} from './content/specificaties.ts';
import {
  addLink,
  createProcessNotification,
  getEAanvraagRequestProcessLabels,
  isRequestProcessActual,
  transformRequestProcess,
} from './helpers.ts';
import type {
  WpiIncomeSpecificationResponseData,
  WpiIncomeSpecificationResponseDataTransformed,
  WpiRequestProcess,
  WpiRequestProcessLabels,
} from './wpi-types.ts';

type FilterResponse = (
  response: ApiResponse<(WpiRequestProcess | null)[]>
) => WpiRequestProcess[];

export interface FetchConfig {
  apiConfigName: SourceApiName;
  filterResponse: FilterResponse;
  requestCacheKey: string;
}

export const wpiAuthHeader = {
  'x-api-key': getFromEnv('BFF_WPI_API_KEY', true),
};

function createBsnPostBody(bsn: string) {
  return {
    bsn,
  };
}

function statusLineTransformer(
  sessionID: SessionID,
  response: WpiRequestProcess[],
  getLabels: (
    requestProcess: WpiRequestProcess
  ) => WpiRequestProcessLabels | null
): WpiRequestProcess[] {
  const statusLineRequestProcesses = response.flatMap((requestProcess) => {
    const labels = getLabels(requestProcess);
    if (labels) {
      return [transformRequestProcess(sessionID, requestProcess, labels)];
    }
    captureMessage('Unknown request process labels', {
      properties: {
        about: requestProcess.about,
        title: requestProcess.title,
        status: requestProcess.steps.findLast((step) => step.isActive)?.status,
      },
    });

    return [];
  });
  return statusLineRequestProcesses;
}

export async function fetchRequestProcess(
  authProfileAndToken: AuthProfileAndToken,
  getLabels: (
    requestProcess: WpiRequestProcess
  ) => WpiRequestProcessLabels | null,
  fetchConfig: FetchConfig
): Promise<ApiResponse_DEPRECATED<WpiRequestProcess[] | null>> {
  const apiConfig = getApiConfig(fetchConfig.apiConfigName, {
    data: createBsnPostBody(authProfileAndToken.profile.id),
    cacheKey_UNSAFE: fetchConfig.requestCacheKey,
    transformResponse: [
      (response: ApiResponse<WpiRequestProcess[]>) =>
        Array.isArray(response.content) ? response.content : [],
    ],
  });

  const response = await requestData<WpiRequestProcess[]>(
    apiConfig,
    authProfileAndToken
  );

  if (response.status === 'OK') {
    const responseFiltered = fetchConfig.filterResponse(response);
    const responseTransformed = statusLineTransformer(
      authProfileAndToken.profile.sid,
      responseFiltered,
      getLabels
    );

    return apiSuccessResult(responseTransformed);
  }

  return response;
}

export async function fetchBijstandsuitkering(
  authProfileAndToken: AuthProfileAndToken
) {
  const filterResponse: FilterResponse = (response) => {
    return (
      response.content
        ?.filter((requestProcess) => requestProcess !== null)
        .filter(
          (requestProcess) => requestProcess?.about === 'Bijstandsuitkering'
        )
        .map((requestProcess) => addLink(requestProcess)) ?? []
    );
  };

  const response = await fetchRequestProcess(
    authProfileAndToken,
    () => bijstandsuitkeringRequestProcessLabels,
    {
      apiConfigName: 'WPI_AANVRAGEN',
      filterResponse,
      requestCacheKey: createSessionBasedCacheKey(
        authProfileAndToken.profile.sid,
        'wpi-aanvragen'
      ),
    }
  );

  return response;
}

export async function fetchEAanvragen(
  authProfileAndToken: AuthProfileAndToken,
  about?: string[]
) {
  const filterResponse: FilterResponse = (response) => {
    return (
      response.content
        ?.filter((requestProcess) => requestProcess !== null)
        .map((requestProcess) => addLink(requestProcess)) ?? []
    );
  };

  const response = await fetchRequestProcess(
    authProfileAndToken,
    getEAanvraagRequestProcessLabels,
    {
      apiConfigName: 'WPI_E_AANVRAGEN',
      filterResponse,
      requestCacheKey: createSessionBasedCacheKey(
        authProfileAndToken.profile.sid,
        'e-aanvragen'
      ),
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

export async function fetchTozo(authProfileAndToken: AuthProfileAndToken) {
  return fetchEAanvragen(authProfileAndToken, [
    'Tozo 1',
    'Tozo 2',
    'Tozo 3',
    'Tozo 4',
    'Tozo 5',
  ]);
}

export async function fetchBbz(authProfileAndToken: AuthProfileAndToken) {
  const bbz = await fetchEAanvragen(authProfileAndToken, ['Bbz']);

  return bbz;
}

export async function fetchTonk(authProfileAndToken: AuthProfileAndToken) {
  return fetchEAanvragen(authProfileAndToken, ['TONK']);
}

export function transformIncomSpecificationResponse(
  sessionID: SessionID,
  response: ApiResponse<WpiIncomeSpecificationResponseData>
) {
  return {
    jaaropgaven:
      response.content?.jaaropgaven
        .map((jaaropgave) =>
          transformIncomeSpecificationItem(sessionID, jaaropgave)
        )
        .sort(dateSort('datePublished', 'desc')) ?? [],
    uitkeringsspecificaties:
      response.content?.uitkeringsspecificaties
        .map((specification) =>
          transformIncomeSpecificationItem(sessionID, specification)
        )
        .sort(dateSort('datePublished', 'desc')) ?? [],
  };
}

export async function fetchSpecificaties(
  authProfileAndToken: AuthProfileAndToken
) {
  const config = getApiConfig('WPI_SPECIFICATIES', {
    transformResponse: (responseData) =>
      transformIncomSpecificationResponse(
        authProfileAndToken.profile.sid,
        responseData
      ),
    data: createBsnPostBody(authProfileAndToken.profile.sid),
  });
  const response =
    await requestData<WpiIncomeSpecificationResponseDataTransformed>(
      config,
      authProfileAndToken
    );

  return response;
}

export async function fetchWpiNotifications(
  authProfileAndToken: AuthProfileAndToken
) {
  const today = new Date();

  const notifications: MyNotification[] = [];

  // Bijstandsuitkeringen
  {
    const { status, content } =
      await fetchBijstandsuitkering(authProfileAndToken);

    if (status === 'OK' && Array.isArray(content)) {
      notifications.push(...getBijstandsuitkeringNotifications(content));
    }
  }

  // E-Aanvragen
  {
    const { status, content } = await fetchEAanvragen(authProfileAndToken);

    if (status === 'OK') {
      const eAanvraagNotifications =
        content
          ?.filter((requestProcess) => {
            return isRequestProcessActual(requestProcess.datePublished, today);
          })
          .flatMap((requestProcess) => {
            const labels = getEAanvraagRequestProcessLabels(requestProcess);

            if (labels) {
              const notifications = requestProcess.steps.map((step) =>
                createProcessNotification(requestProcess, step, labels)
              );
              return notifications;
            }
            return [];
          }) ?? [];

      notifications.push(...eAanvraagNotifications);
    }
  }

  // Specificaties
  {
    const { status, content } = await fetchSpecificaties(authProfileAndToken);

    if (status === 'OK' && content) {
      notifications.push(...getSpecificatieNotifications(content));
    }
  }

  return apiSuccessResult({ notifications: notifications.filter(Boolean) });
}

export async function fetchWpiDocument(
  authProfileAndToken: AuthProfileAndToken,
  documentId: string,
  queryParams?: Record<string, string>
) {
  const url = `${process.env.BFF_WPI_API_BASE_URL}/wpi/document`;

  return requestData<DocumentDownloadData>(
    {
      method: 'POST',
      url,
      responseType: 'stream',
      params: {
        ...pick(queryParams ?? {}, ['isBulk', 'isDms']),
        id: documentId,
      },
      ...wpiAuthHeader,
      data: createBsnPostBody(authProfileAndToken.profile.id),
      transformResponse: (documentResponseData) => {
        return {
          filename: 'Brief.pdf',
          mimetype: DEFAULT_DOCUMENT_DOWNLOAD_MIME_TYPE,
          data: documentResponseData,
        };
      },
    },
    authProfileAndToken
  );
}
