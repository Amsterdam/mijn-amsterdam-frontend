import { API_BASE_PATH } from '../../../universal/config';
import {
  apiErrorResult,
  apiSuccesResult,
  ApiSuccessResponse,
  defaultDateFormat,
} from '../../../universal/helpers';
import { MyNotification, StatusLine } from '../../../universal/types';
import { getApiConfig, SourceApiKey } from '../../config';
import { requestData } from '../../helpers';
import { requestProcess as bbzRequestProcessLabels } from './content/bbz';
import { requestProcess as bijstandsuitkeringRequestProcessLabels } from './content/bijstandsuitkering';
import {
  getNotifications as getStadspasNotifications,
  requestProcess as stadspasRequestProcessLabels,
} from './content/stadspas';
import { requestProcess as tonkRequestProcessLabels } from './content/tonk';
import { requestProcess as tozoRequestProcessLabels } from './content/tozo';
import { documentDownloadName, transformToStatusLine } from './helpers';
import {
  WpiIncomeSpecification,
  WpiIncomeSpecificationResponseData,
  WpiIncomeSpecificationResponseDataTransformed,
  WpiIncomeSpecificationTransformed,
  WpiRequestProcess,
  WpiRequestProcessLabels,
  WpiStadspasResponseData,
} from './wpi-types';

const DEFAULT_SPECIFICATION_CATEGORY = 'Uitkering';

type FilterResponse<R extends WpiRequestProcess[] = WpiRequestProcess[]> = (
  response: ApiSuccessResponse<R>
) => R;

interface FetchConfig {
  apiConfigName: SourceApiKey;
  filterResponse: FilterResponse<any>;
  requestCacheKey: string;
}

function fetchRequestProcess<R extends WpiRequestProcess>(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  labels: WpiRequestProcessLabels,
  fetchConfig: FetchConfig
) {
  const response = requestData<StatusLine[]>(
    getApiConfig(fetchConfig.apiConfigName, {
      cacheKey: fetchConfig.requestCacheKey,
      transformResponse: [
        fetchConfig.filterResponse,
        (response: R[]) =>
          response.map((requestProcess) =>
            transformToStatusLine(requestProcess, labels)
          ),
      ],
    }),
    sessionID,
    passthroughRequestHeaders
  );

  return response;
}

export function fetchBijstandsuitkering(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const filterResponse: FilterResponse = (response) =>
    response.content.filter(
      (requestProcess) => requestProcess.about === 'Bijstandsuitkering'
    );

  return fetchRequestProcess(
    sessionID,
    passthroughRequestHeaders,
    bijstandsuitkeringRequestProcessLabels,
    {
      apiConfigName: 'WPI_AANVRAGEN',
      filterResponse,
      requestCacheKey: 'fetch-aanvragen-bijstandsuitkering-' + sessionID,
    }
  );
}

export async function fetchStadspas(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const filterResponse: FilterResponse = (response) => {
    return response.content.filter(
      (requestProcess) => requestProcess.about === 'Stadspas'
    );
  };

  const aanvragenRequest = fetchRequestProcess(
    sessionID,
    passthroughRequestHeaders,
    stadspasRequestProcessLabels,
    {
      apiConfigName: 'WPI_AANVRAGEN',
      filterResponse,
      requestCacheKey: 'fetch-aanvragen-stadspas-' + sessionID,
    }
  );

  const stadspassenRequest = requestData<WpiStadspasResponseData>(
    getApiConfig('WPI_STADSPAS', {
      transformResponse: (response: ApiSuccessResponse<any>) =>
        response.content,
    }),
    sessionID,
    passthroughRequestHeaders
  );

  const [aanvragenResult, stadspassenResult] = await Promise.all([
    aanvragenRequest,
    stadspassenRequest,
  ]);

  // TODO: Fix partial errors
  return apiSuccesResult({
    aanvragen: aanvragenResult.content,
    ...stadspassenResult.content,
  });
}

export function fetchTozo(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const filterResponse: FilterResponse = (response) => {
    return response.content.filter((requestProcess) => {
      return requestProcess.about.startsWith('Tozo');
    });
  };

  return fetchRequestProcess(
    sessionID,
    passthroughRequestHeaders,
    tozoRequestProcessLabels,
    {
      apiConfigName: 'WPI_E_AANVRAGEN',
      filterResponse,
      requestCacheKey: 'fetch-aanvragen-tozo-' + sessionID,
    }
  );
}

export function fetchBbz(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const filterResponse: FilterResponse = (response) =>
    response.content.filter((requestProcess) =>
      requestProcess.about.startsWith('Bbz')
    );

  return fetchRequestProcess(
    sessionID,
    passthroughRequestHeaders,
    bbzRequestProcessLabels,
    {
      apiConfigName: 'WPI_E_AANVRAGEN',
      filterResponse,
      requestCacheKey: 'fetch-aanvragen-bbz-' + sessionID,
    }
  );
}

export function fetchTonk(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const filterResponse: FilterResponse = (response) =>
    response.content.filter(
      (requestProcess) => requestProcess.about === 'TONK'
    );

  return fetchRequestProcess(
    sessionID,
    passthroughRequestHeaders,
    tonkRequestProcessLabels,
    {
      apiConfigName: 'WPI_E_AANVRAGEN',
      filterResponse,
      requestCacheKey: 'fetch-aanvragen-tonk-' + sessionID,
    }
  );
}

export function transformIncomSpecificationItem(
  item: WpiIncomeSpecification
): WpiIncomeSpecificationTransformed {
  const displayDatePublished = defaultDateFormat(item.datePublished);
  const url = `${API_BASE_PATH}/${item.url}`;
  const categoryFromSource = item.variant;
  return {
    ...item,
    category: categoryFromSource || DEFAULT_SPECIFICATION_CATEGORY,
    url,
    download: documentDownloadName(item),
    displayDatePublished,
  };
}

export function transformIncomSpecificationResponse(
  response: ApiSuccessResponse<WpiIncomeSpecificationResponseData>
) {
  return {
    jaaropgaven: response.content.jaaropgaven.map(
      transformIncomSpecificationItem
    ),
    uitkeringsspecificaties: response.content.uitkeringsspecificaties.map(
      transformIncomSpecificationItem
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

// Notifications and Recent cases
export function fetchBijstandsuitkeringGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return apiSuccesResult([] as MyNotification[]);
}

export async function fetchStadspasGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  const { status, content } = await fetchStadspas(
    sessionID,
    passthroughRequestHeaders
  );
  let notifications: MyNotification[] = [];
  if (status === 'OK') {
    notifications = getStadspasNotifications(content);
  }
  return apiSuccesResult(notifications);
}

export function fetchSpecificationsGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return apiSuccesResult([] as MyNotification[]);
}

export function fetchTozoGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return apiSuccesResult([] as MyNotification[]);
}

export function fetchTonkGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return apiSuccesResult([] as MyNotification[]);
}

export function fetchBbzGenerated(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return apiSuccesResult([] as MyNotification[]);
}

export async function fetchNotificationsAndRecentCases(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  // const WPI_AANVRAGEN = await fetchAanvragen(
  //   sessionID,
  //   passthroughRequestHeaders
  // );
  // const compareDate = new Date();

  // let notifications: MyNotification[] = [];
  // let cases: MyCase[] = [];

  // if (WPI_AANVRAGEN.status === 'OK') {
  //   const items = WPI_AANVRAGEN.content;
  //   notifications = items
  //     .filter(
  //       (item) =>
  //         !IS_PRODUCTION ||
  //         isNotificationActual(item.datePublished, compareDate)
  //     )
  //     .map(createFocusNotification);

  //   cases = items
  //     .filter(
  //       (item) =>
  //         isRecentCase(item.datePublished, compareDate) ||
  //         item.status !== 'besluit'
  //     )
  //     .map(createFocusRecentCase)
  //     .filter((recentCase) => recentCase !== null);

  //   return apiSuccesResult({
  //     cases,
  //     notifications,
  //   });
  // }

  return apiErrorResult('Not implemented', null);
}
