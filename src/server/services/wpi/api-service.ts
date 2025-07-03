import {
  ApiResponse_DEPRECATED,
  ApiSuccessResponse,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { dateSort } from '../../../universal/helpers/date';
import { pick } from '../../../universal/helpers/utils';
import { MyNotification } from '../../../universal/types/App.types';
import { AuthProfileAndToken } from '../../auth/auth-types';
import { SourceApiKey } from '../../config/source-api';
import {
  createSessionBasedCacheKey,
  getApiConfig,
} from '../../helpers/source-api-helpers';
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
import process from "node:process";

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
  authProfileAndToken: AuthProfileAndToken,
  getLabels: (
    requestProcess: WpiRequestProcess
  ) => WpiRequestProcessLabels | undefined,
  fetchConfig: FetchConfig
): Promise<ApiResponse_DEPRECATED<WpiRequestProcess[] | null>> {
  const apiConfig = getApiConfig(fetchConfig.apiConfigName, {
    cacheKey_UNSAFE: fetchConfig.requestCacheKey,
    transformResponse: [
      (response: ApiSuccessResponse<WpiRequestProcess[]>) => response.content,
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
  const filterResponse: FilterResponse = (response) =>
    response.content
      ?.filter(
        (requestProcess) => requestProcess?.about === 'Bijstandsuitkering'
      )
      .map((requestProcess) => addLink(requestProcess));

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
    return response.content.map((requestProcess) => addLink(requestProcess));
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

export async function fetchSpecificaties(
  authProfileAndToken: AuthProfileAndToken
) {
  const response =
    await requestData<WpiIncomeSpecificationResponseDataTransformed>(
      getApiConfig('WPI_SPECIFICATIES', {
        transformResponse: (responseData) =>
          transformIncomSpecificationResponse(
            authProfileAndToken.profile.sid,
            responseData
          ),
      }),
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
    const { status, content } = await fetchEAanvragen(authProfileAndToken);

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
                createProcessNotification(requestProcess, step, labels)
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
    const { status, content } = await fetchSpecificaties(authProfileAndToken);

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
    authProfileAndToken
  );
}
