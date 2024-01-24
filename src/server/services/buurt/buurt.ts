import * as Sentry from '@sentry/node';
import { IS_TAP } from '../../../universal/config/env';
import {
  DatasetFilterSelection,
  DatasetId,
  POLYLINE_GEOMETRY_TYPES,
} from '../../../universal/config/myarea-datasets';
import { apiErrorResult, apiSuccessResult } from '../../../universal/helpers';
import { ApiResponse } from '../../../universal/helpers/api';
import { DataRequestConfig } from '../../config';
import { requestData } from '../../helpers';
import FileCache from '../../helpers/file-cache';
import {
  ACCEPT_CRS_4326,
  BUURT_CACHE_TTL_1_DAY_IN_MINUTES,
  DatasetConfig,
  DatasetFeatures,
  DatasetResponse,
  DEFAULT_API_REQUEST_TIMEOUT,
} from './datasets';
import {
  createDynamicFilterConfig,
  datasetApiResult,
  discoverSingleApiEmbeddedResponse,
  filterAndRefineFeatures,
  filterPolylineFeaturesWithinBoundingBox,
  getDatasetEndpointConfig,
  getDynamicDatasetFilters,
} from './helpers';

const fileCaches: Record<string, FileCache> = {};

// This values means that the file-cache will never expire. Update the cache by deleting the file.
const CACHE_VALUE_NO_EXPIRE = -1;

export function fileCache(
  name: string,
  cacheTimeMinutes: number,
  triesUntilConsiderdStale: number
) {
  if (!fileCaches[name]) {
    fileCaches[name] = new FileCache({
      name,
      cacheTimeMinutes,
      triesUntilConsiderdStale,
    });
  }
  return fileCaches[name];
}

export async function fetchDataset(
  requestID: requestID,
  datasetId: DatasetId,
  datasetConfig: DatasetConfig,
  params: { [key: string]: any } = {},
  pruneCache: boolean = false
) {
  const cacheTimeMinutes = IS_TAP
    ? datasetConfig.cacheTimeMinutes || BUURT_CACHE_TTL_1_DAY_IN_MINUTES
    : CACHE_VALUE_NO_EXPIRE;

  let dataCache: FileCache | null = null;

  if (datasetConfig.cache !== false && !pruneCache) {
    dataCache = fileCache(
      datasetId,
      cacheTimeMinutes,
      datasetConfig.triesUntilConsiderdStale
    );

    if (dataCache) {
      const features = dataCache.getKey('features');
      const filters = dataCache.getKey('filters');
      if (features) {
        const apiData: DatasetResponse = {
          features,
        };
        if (filters) {
          apiData.filters = filters;
        }

        return Promise.resolve(apiSuccessResult(apiData));
      }
    }
  }

  const config = { ...(datasetConfig.requestConfig || {}) };

  if (params) {
    config.params = {
      ...(config.params || {}),
      ...params,
    };
  }

  const url =
    typeof datasetConfig.listUrl === 'function'
      ? datasetConfig.listUrl(datasetConfig)
      : datasetConfig.listUrl;

  const requestConfig: DataRequestConfig = {
    url,
    cancelTimeout: DEFAULT_API_REQUEST_TIMEOUT,
    ...config,
  };

  requestConfig.headers = ACCEPT_CRS_4326;
  if (typeof datasetConfig.transformList === 'function') {
    requestConfig.transformResponse = (responseData) => {
      return datasetConfig.transformList!(
        datasetId,
        datasetConfig,
        responseData
      );
    };
  }

  const response = await requestData<DatasetFeatures>(requestConfig, requestID);

  if (response.status === 'OK') {
    const filterConfig = getDynamicDatasetFilters(datasetId);

    const filters =
      filterConfig &&
      createDynamicFilterConfig(datasetId, response.content, filterConfig);
    if (dataCache && response.content.length && datasetConfig.cache !== false) {
      dataCache.setKey('url', url);
      dataCache.setKey('features', response.content);
      if (filters) {
        dataCache.setKey('filters', filters);
      }
      dataCache.save();
    }
    // If cache is stale we throw an error to sentry.
    if (dataCache && dataCache.isStale()) {
      Sentry.captureMessage(
        `MyArea dataset ${datasetId} is returning stale data`,
        {
          tags: {
            url: requestConfig.url,
          },
          extra: {
            datasetId,
            url,
          },
        }
      );
    }

    const apiResponse: DatasetResponse = { features: response.content };

    if (filters) {
      apiResponse.filters = filters;
    }

    return apiSuccessResult(apiResponse);
  }

  return response;
}

type ApiDatasetResponse = ApiResponse<DatasetResponse | null>;

export async function loadDatasetFeatures(
  requestID: requestID,
  configs: Array<[string, DatasetConfig]>
) {
  const requests: Array<Promise<ApiDatasetResponse>> = [];

  for (const datasetConfig of configs) {
    const [id, config] = datasetConfig;

    requests.push(
      fetchDataset(requestID, id, config).then((result) => {
        return {
          ...result,
          id,
        };
      })
    );
  }

  const results = await Promise.all(requests);

  return datasetApiResult(results);
}

export async function loadPolylineFeatures(
  requestID: requestID,
  {
    datasetIds,
    bbox,
    filters,
  }: {
    datasetIds: string[];
    bbox: [number, number, number, number];
    filters: DatasetFilterSelection;
  }
) {
  const configs = getDatasetEndpointConfig(datasetIds, POLYLINE_GEOMETRY_TYPES);
  const requests: Array<Promise<ApiDatasetResponse>> = [];

  for (const datasetConfig of configs) {
    const [datasetId, config] = datasetConfig;

    requests.push(
      fetchDataset(requestID, datasetId, config, {}).then((result) => {
        return {
          ...result,
          id: datasetId,
        };
      })
    );
  }

  const results = await Promise.all(requests);
  const result = datasetApiResult(results);

  const featuresWithinBoundingbox = filterPolylineFeaturesWithinBoundingBox(
    result.features,
    bbox
  );
  return {
    ...result,
    ...filterAndRefineFeatures(
      featuresWithinBoundingbox,
      datasetIds,
      filters,
      result.filters
    ),
  };
}

export async function loadFeatureDetail(
  requestID: requestID,
  datasetId: string,
  id: string
) {
  const [datasetConfig] = getDatasetEndpointConfig([datasetId]);

  if (!datasetConfig) {
    return apiErrorResult(`Unknown dataset ${datasetId}`, null);
  }

  const [, config] = datasetConfig;
  const detailUrl =
    typeof config.detailUrl === 'function'
      ? config.detailUrl(config)
      : config.detailUrl;

  let url = config.idKeyDetail
    ? `${detailUrl}?${config.idKeyDetail}=${id}`
    : `${detailUrl}${id}`;

  // Some of the datasets don't have a specific endpoint to retrieve the details of a datapoint (via detailsUrl).
  // In such cases the details are provided along with the list of all datapoints (via the listUrl).
  if (!detailUrl) {
    const listUrl =
      typeof config.listUrl === 'function'
        ? config.listUrl(config)
        : config.listUrl;

    if (listUrl) url = listUrl;
  }

  const requestConfig: DataRequestConfig = {
    url,
    cacheTimeout: 0,
  };

  requestConfig.headers = ACCEPT_CRS_4326;

  if (config.transformDetail) {
    requestConfig.transformResponse = config.transformDetail.bind(
      null,
      datasetId,
      config,
      id
    );
  }

  if (config.requestConfig?.nextUrls) {
    requestConfig.nextUrls = config.requestConfig?.nextUrls;
  }

  if (config.requestConfig?.request) {
    requestConfig.request = config.requestConfig.request;
  }

  const response: any = await requestData(requestConfig, requestID);

  if (response.status === 'OK') {
    const item = discoverSingleApiEmbeddedResponse(response.content);

    // Replace the value of the `idKeyDetail` property. E.g. idKeyDetail = someOtherId  item.id = item.someOtherId;
    if (config.idKeyDetail) {
      item.id = encodeURIComponent(item[config.idKeyDetail]);
    }
    if (item) {
      return apiSuccessResult(item);
    }
  }

  return response;
}
