import {
  DatasetFilterSelection,
  DatasetId,
  POLYLINE_GEOMETRY_TYPES,
} from '../../../universal/config/buurt';
import { IS_AP } from '../../../universal/config/env';
import { apiErrorResult, apiSuccesResult } from '../../../universal/helpers';
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

export function fileCache(name: string, cacheTimeMinutes: number) {
  if (!fileCaches[name]) {
    fileCaches[name] = new FileCache({
      name,
      cacheTimeMinutes,
    });
  }
  return fileCaches[name];
}

export async function fetchDataset(
  sessionID: SessionID,
  datasetId: DatasetId,
  datasetConfig: DatasetConfig,
  params?: { [key: string]: any }
) {
  const cacheTimeMinutes = IS_AP
    ? datasetConfig.cacheTimeMinutes || BUURT_CACHE_TTL_1_DAY_IN_MINUTES
    : CACHE_VALUE_NO_EXPIRE;

  let dataCache: FileCache | null = null;

  if (datasetConfig.cache !== false) {
    dataCache = fileCache(datasetId, cacheTimeMinutes);

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

        return Promise.resolve(apiSuccesResult(apiData));
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
    requestConfig.transformResponse = (responseData) =>
      datasetConfig.transformList!(datasetId, datasetConfig, responseData);
  }

  const response = await requestData<DatasetFeatures>(
    requestConfig,
    sessionID,
    {}
  );

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

    const apiResponse: DatasetResponse = { features: response.content };

    if (filters) {
      apiResponse.filters = filters;
    }

    return apiSuccesResult(apiResponse);
  }

  return response;
}

type ApiDatasetResponse = ApiResponse<DatasetResponse | null>;

export async function loadDatasetFeatures(
  sessionID: SessionID,
  configs: Array<[string, DatasetConfig]>
) {
  const requests: Array<Promise<ApiDatasetResponse>> = [];

  for (const datasetConfig of configs) {
    const [id, config] = datasetConfig;

    requests.push(
      fetchDataset(sessionID, id, config).then((result) => {
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
  sessionID: SessionID,
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
      fetchDataset(sessionID, datasetId, config, {}).then((result) => {
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
  sessionID: SessionID,
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

  const url = config.idKeyDetail
    ? `${detailUrl}?${config.idKeyDetail}=${id}`
    : `${detailUrl}${id}`;

  const requestConfig: DataRequestConfig = {
    url,
    cacheTimeout: 0,
  };

  requestConfig.headers = ACCEPT_CRS_4326;

  if (config.transformDetail) {
    requestConfig.transformResponse = config.transformDetail.bind(
      null,
      datasetId,
      config
    );
  }

  const response = await requestData(requestConfig, sessionID, {});
  if (response.status === 'OK') {
    const item = discoverSingleApiEmbeddedResponse(response.content);
    // Replace the value of the `idKeyDetail` property. E.g. idKeyDetail = someOtherId  item.id = item.someOtherId;
    if (config.idKeyDetail) {
      item.id = encodeURIComponent(item[config.idKeyDetail]);
    }
    if (item) {
      return apiSuccesResult(item);
    }
  }

  return response;
}
