import { Themas } from '../../../universal/config/thema';
import {
  ApiResponse_DEPRECATED,
  ApiSuccessResponse,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { dateSort } from '../../../universal/helpers/date';
import { pick } from '../../../universal/helpers/utils';
import { MyNotification } from '../../../universal/types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { SourceApiKey } from '../../config/source-api';
import { getApiConfig } from '../../helpers/source-api-helpers';
import { requestData } from '../../helpers/source-api-request';
import { captureMessage } from '../monitoring';
import {
  DEFAULT_DOCUMENT_DOWNLOAD_MIME_TYPE,
  DocumentDownloadData,
} from '../shared/document-download-route-handler';
import {
  requestProcess as bijstandsuitkeringRequestProcessLabels,
  getNotifications as getBijstandsuitkeringNotifications,
} from './content/bijstandsuitkering';
import {
  getNotifications as getSpecificatieNotifications,
  transformIncomeSpecificationItem,
} from './content/specificaties';
import {
  addLink,
  createProcessNotification,
  getEAanvraagRequestProcessLabels,
  isRequestProcessActual,
  transformRequestProcess,
} from './helpers';
import {
  WpiIncomeSpecificationResponseData,
  WpiIncomeSpecificationResponseDataTransformed,
  WpiRequestProcess,
  WpiRequestProcessLabels,
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
  sessionID: SessionID,
  response: WpiRequestProcess[],
  getLabels: (
    requestProcess: WpiRequestProcess
  ) => WpiRequestProcessLabels | undefined
): WpiRequestProcess[] {
  const statusLineRequestProcesses = response?.flatMap((requestProcess) => {
    const labels = getLabels(requestProcess);
    if (labels) {
      return [transformRequestProcess(sessionID, requestProcess, labels)];
    }
    captureMessage('Unknown request process labels', {
      properties: {
        about: requestProcess.about,
        title: requestProcess.title,
        status: requestProcess.statusId,
      },
    });

    return [];
  });
  return statusLineRequestProcesses;
}

export async function fetchRequestProcess(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  getLabels: (
    requestProcess: WpiRequestProcess
  ) => WpiRequestProcessLabels | undefined,
  fetchConfig: FetchConfig
): Promise<ApiResponse_DEPRECATED<WpiRequestProcess[] | null>> {
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
  requestID: RequestID,
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

export async function fetchEAanvragen(
  requestID: RequestID,
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
  requestID: RequestID,
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
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const bbz = await fetchEAanvragen(requestID, authProfileAndToken, ['Bbz']);

  return bbz;
}

export async function fetchTonk(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  return fetchEAanvragen(requestID, authProfileAndToken, ['TONK']);
}

export function transformIncomSpecificationResponse(
  sessionID: SessionID,
  response: ApiSuccessResponse<WpiIncomeSpecificationResponseData>
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

export function fetchSpecificaties(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const response = requestData<WpiIncomeSpecificationResponseDataTransformed>(
    getApiConfig('WPI_SPECIFICATIES', {
      transformResponse: (responseData) =>
        transformIncomSpecificationResponse(
          authProfileAndToken.profile.sid,
          responseData
        ),
    }),
    requestID,
    authProfileAndToken
  );

  return response;
}

export async function fetchWpiNotifications(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken
) {
  const today = new Date();

  const notifications: MyNotification[] = [];

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
                  Themas.INKOMEN
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

export async function fetchWpiDocument(
  requestID: RequestID,
  authProfileAndToken: AuthProfileAndToken,
  documentId: string,
  queryParams?: Record<string, string>
) {
  const url = `${process.env.BFF_WPI_API_BASE_URL}/wpi/document`;

  return requestData<DocumentDownloadData>(
    {
      url,
      responseType: 'stream',
      params: {
        ...pick(queryParams ?? {}, ['isBulk', 'isDms']),
        id: documentId,
      },
      headers: {
        Authorization: `Bearer ${authProfileAndToken.token}`,
      },
      transformResponse: (documentResponseData) => {
        return {
          filename: 'Brief.pdf',
          mimetype: DEFAULT_DOCUMENT_DOWNLOAD_MIME_TYPE,
          data: documentResponseData,
        };
      },
    },
    requestID,
    authProfileAndToken
  );
}
