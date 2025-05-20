import { IS_TAP } from '../../../universal/config/env';
import {
  DatasetFilterSelection,
  DatasetId,
  DatasetPropertyFilter,
  POLYLINE_GEOMETRY_TYPES,
} from '../../../universal/config/myarea-datasets';
import {
  ApiResponse_DEPRECATED,
  apiErrorResult,
  apiSuccessResult,
} from '../../../universal/helpers/api';
import { DataRequestConfig } from '../../config/source-api';
import FileCache from '../../helpers/file-cache';
import { requestData } from '../../helpers/source-api-request';
import { captureMessage } from '../monitoring';
import {
  ACCEPT_CRS_4326,
  BUURT_CACHE_TTL_1_DAY_IN_MINUTES,
  DEFAULT_API_REQUEST_TIMEOUT,
  DatasetConfig,
  DatasetFeatures,
  DatasetResponse,
} from './datasets';
import {
  discoverSingleDsoApiEmbeddedResponse,
  DsoApiResponse,
} from './dso-helpers';
import {
  createDynamicFilterConfig,
  datasetApiResult,
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

function getDatasetFileCache(
  datasetId: DatasetId,
  datasetConfig: DatasetConfig
) {
  const cacheTimeMinutes = IS_TAP
    ? datasetConfig.cacheTimeMinutes || BUURT_CACHE_TTL_1_DAY_IN_MINUTES
    : CACHE_VALUE_NO_EXPIRE;

  return fileCache(
    datasetId,
    cacheTimeMinutes,
    datasetConfig.triesUntilConsiderdStale
  );
}

export async function fetchDataset(
  datasetId: DatasetId,
  datasetConfig: DatasetConfig,
  params: Record<string, string> = {},
  pruneCache: boolean = false
) {
  let dataCache: FileCache | null = null;

  if (datasetConfig.cache !== false && !pruneCache) {
    dataCache = getDatasetFileCache(datasetId, datasetConfig);

    if (dataCache) {
      const features = dataCache.getKey<DatasetFeatures>('features');
      const filters = dataCache.getKey<DatasetPropertyFilter>('filters');

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
    const transformList = datasetConfig.transformList;
    requestConfig.transformResponse = (responseData) => {
      return transformList(datasetId, datasetConfig, responseData);
    };
  }

  const response = await requestData<DatasetFeatures>(requestConfig);

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

    // If cache is stale we throw an error to monitoring.
    if (dataCache && dataCache.isStale()) {
      captureMessage(`MyArea dataset ${datasetId} is returning stale data`, {
        tags: {
          url: requestConfig.url ?? '',
        },
        properties: {
          datasetId,
          url,
        },
      });
    }

    const apiResponse: DatasetResponse = { features: response.content };

    if (filters) {
      apiResponse.filters = filters;
    }

    return apiSuccessResult(apiResponse);
  }

  return response;
}

type ApiDatasetResponse = ApiResponse_DEPRECATED<DatasetResponse | null>;

export async function loadDatasetFeatures(
  configs: Array<[string, DatasetConfig]>
) {
  const requests: Array<Promise<ApiDatasetResponse>> = [];

  for (const datasetConfig of configs) {
    const [id, config] = datasetConfig;

    requests.push(
      fetchDataset(id, config).then((result) => {
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

export async function loadPolylineFeatures({
  datasetIds,
  bbox,
  filters,
}: {
  datasetIds: string[];
  bbox: [number, number, number, number];
  filters: DatasetFilterSelection;
}) {
  const configs = getDatasetEndpointConfig(datasetIds, POLYLINE_GEOMETRY_TYPES);
  const requests: Array<Promise<ApiDatasetResponse>> = [];

  for (const datasetConfig of configs) {
    const [datasetId, config] = datasetConfig;

    requests.push(
      fetchDataset(datasetId, config, {}).then((result) => {
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

export async function loadFeatureDetail(datasetId: string, id: string) {
  const [datasetConfig] = getDatasetEndpointConfig([datasetId]);
  const [, config] = datasetConfig ?? [];

  if (!config) {
    return apiErrorResult(
      `No DatasetConfig found for dataset with id ${datasetId}`,
      null
    );
  }

  const fileCache = getDatasetFileCache(datasetId, config);

  const detailUrl =
    typeof config.detailUrl === 'function'
      ? config.detailUrl(config)
      : config.detailUrl;

  /**
   * If we don't have a detailUrl specified we try to pass the cache of the complete dataset as argument.
   * This way we can extract the detail data from the dataset cache in the transformDetail function.
   */
  if (!detailUrl) {
    if (config.transformDetail) {
      try {
        // We can't provide response data here because we don't have an Url to request to.
        const detailFeature = config.transformDetail(
          null as unknown as DsoApiResponse,
          {
            datasetId,
            config,
            id,
            datasetCache: fileCache,
          }
        );
        return apiSuccessResult(detailFeature);
      } catch (error: unknown) {
        return apiErrorResult((error as Error).message, null);
      }
    } else {
      // No detail url and no transformer found, we can't proceed with returning detail data.
      return apiErrorResult(
        `No url or transformer found for dataset ${datasetId} and detail ${id}`,
        null
      );
    }
  }

  /**
   * Many of the used data.amsterdam.nl api's use standardized querying functionality. The code below forms urls like:
   * https://some-domein/api/dataset/detail/?someOtherIdQueryKey=$id
   * or:
   * https://some-domein/api/dataset/detail/$id
   */
  const url = config.idKeyDetail
    ? `${detailUrl}?${config.idKeyDetail}=${id}`
    : `${detailUrl}${id}`;

  let requestConfig: DataRequestConfig = {
    url,
    cacheTimeout: 0,
    headers: ACCEPT_CRS_4326,
  };

  if (typeof config.transformDetail === 'function') {
    const transformDetail = config.transformDetail;
    requestConfig = {
      ...requestConfig,
      cacheKey: [datasetId, id].join('-'),
      transformResponse: (responseData: DsoApiResponse) =>
        transformDetail(responseData, {
          datasetId,
          config,
          id,
          datasetCache: fileCache,
        }),
    };
  }

  if (config.requestConfig?.request) {
    requestConfig.request = config.requestConfig.request;
  }

  const response = await requestData<DsoApiResponse>(requestConfig);

  if (response.status === 'OK') {
    const item = discoverSingleDsoApiEmbeddedResponse(response.content);
    if (!item) {
      return response;
    }
    /**
     * Assign a custom ID value represented by the key specified in config.idKeyDetail.
     * For example, if we have feature data like:
     * let item = {
     *   SomeIdAttribute: 'xx11xx',
     *   name: 'A feature',
     * }
     *
     * And:
     *
     * let idKeyDetail = 'SomeIdAttribute';
     *
     * Becomes:
     *
     * item = {
     *   id: 'xx11xx',
     *   SomeIdAttribute: 'xx11xx',
     *   name: 'A feature',
     * }
     *
     */
    if (config.idKeyDetail) {
      item.id = encodeURIComponent(
        item[config.idKeyDetail] as string | number | boolean
      );
    }
    if (item) {
      return apiSuccessResult(item);
    }
  }

  return response;
}
