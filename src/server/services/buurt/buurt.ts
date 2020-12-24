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
  filterAndRefineFeatures,
  filterPolylineFeaturesWithinBoundingBox,
  getDatasetEndpointConfig,
  getDynamicDatasetFilters,
  recursiveCoordinateSwap,
} from './helpers';

const fileCaches: Record<string, FileCache> = {};

const fileCache = (name: string, cacheTimeMinutes: number) => {
  if (!fileCaches[name]) {
    fileCaches[name] = new FileCache({
      name,
      cacheTimeMinutes,
    });
  }
  return fileCaches[name];
};

export async function fetchDataset(
  sessionID: SessionID,
  datasetId: DatasetId,
  datasetConfig: DatasetConfig,
  params?: { [key: string]: any }
) {
  const cacheTimeMinutes = IS_AP
    ? datasetConfig.cacheTimeMinutes || BUURT_CACHE_TTL_1_DAY_IN_MINUTES
    : -1;

  let dataCache: FileCache | null = null;

  if (datasetConfig.cache !== false) {
    dataCache = fileCache(datasetId, cacheTimeMinutes);

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

  if (datasetConfig.transformList) {
    requestConfig.transformResponse = datasetConfig.transformList.bind(
      null,
      datasetId,
      datasetConfig
    );
  }

  const response = await requestData<DatasetFeatures>(
    requestConfig,
    sessionID,
    {}
  );

  if (response.status === 'OK') {
    response.content = Array.isArray(response.content)
      ? response.content.map((feature) => {
          if (POLYLINE_GEOMETRY_TYPES.includes(feature.geometry.type)) {
            // Swap the coordinates of the polyline datasets so leaflet can render them easily on the front-end.
            feature.geometry.coordinates = recursiveCoordinateSwap(
              feature.geometry.coordinates
            );
          }
          return feature;
        })
      : [];

    const filterConfig = getDynamicDatasetFilters(datasetId);
    const filters =
      filterConfig && createDynamicFilterConfig(response.content, filterConfig);

    if (dataCache && datasetConfig.cache !== false) {
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

  return Promise.all(requests).then(datasetApiResult);
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
  const configs = getDatasetEndpointConfig(datasetIds, [
    'MultiPolygon',
    'MultiLineString',
    'Polygon',
  ]);

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
  const url = `${config.detailUrl}${id}`;

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

  return requestData(requestConfig, sessionID, {});
}
