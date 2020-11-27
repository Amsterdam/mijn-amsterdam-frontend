import {
  DatasetFilterSelection,
  DatasetId,
  DatasetPropertyFilter,
  DATASETS,
  getDatasetCategoryId,
} from '../../../universal/config/buurt';
import { IS_AP } from '../../../universal/config/env';
import { apiErrorResult, apiSuccesResult } from '../../../universal/helpers';
import {
  ApiErrorResponse,
  ApiResponse,
  ApiSuccessResponse,
} from '../../../universal/helpers/api';
import { DataRequestConfig } from '../../config';
import { requestData } from '../../helpers';
import FileCache from '../../helpers/file-cache';
import {
  ACCEPT_CRS_4326,
  BUURT_CACHE_TTL_1_DAY_IN_MINUTES,
  DatasetConfig,
  DatasetFeatures,
  DatasetResponse,
  MaFeature,
  MaPointFeature,
} from './datasets';
import { getDatasetEndpointConfig, recursiveCoordinateSwap } from './helpers';

const fileCaches: Record<string, FileCache> = {};

const fileCache = (id: string, cacheTimeMinutes: number) => {
  if (!fileCaches[id]) {
    fileCaches[id] = new FileCache({
      name: `./buurt/${id}.flat-cache.json`,
      cacheTimeMinutes,
    });
  }
  return fileCaches[id];
};

function getDynamicDatasetFilters(datasetId: DatasetId) {
  const datasetCategoryId = getDatasetCategoryId(datasetId);

  if (!datasetCategoryId) {
    return;
  }

  const propertyFilters =
    DATASETS[datasetCategoryId].datasets[datasetId]?.filters;

  if (!propertyFilters) {
    return;
  }

  // Only select property filters that don't have static values defined.
  return Object.fromEntries(
    Object.entries(propertyFilters).filter(([propertyId, property]) => {
      return !property.values.length;
    })
  );
}

export function createDynamicFilterConfig(
  features: MaFeature[],
  filterConfig: DatasetPropertyFilter
) {
  const filters: DatasetPropertyFilter = {};
  const propertyNames = Object.keys(filterConfig);
  for (const propertyName of propertyNames) {
    // Collect distinct property values from the dataset
    filters[propertyName] = {
      values: Array.from(
        new Set(
          features.map((feature) => {
            console.log(feature, filterConfig);
            // Get property value from object.properties or from object itself
            return (
              (feature?.properties || feature)[propertyName] ||
              filterConfig[propertyName].emptyValue ||
              'EMPTY_VALUE'
            );
          })
        )
      ),
    };
  }

  return filters;
}

// Matches feature properties to requested filters
function isFilterMatch(feature: MaFeature, filters: DatasetPropertyFilter) {
  return Object.entries(filters).every(([propertyName, valueConfig]) => {
    const propertyValues = valueConfig.values;
    return (
      !propertyValues.length ||
      (propertyName in feature.properties &&
        propertyValues.includes(feature.properties[propertyName]))
    );
  });
}

export function filterDatasetFeatures(
  features: DatasetFeatures,
  activeDatasetIds: DatasetId[],
  filters: DatasetFilterSelection
) {
  return features
    .filter((feature): feature is MaPointFeature => {
      return activeDatasetIds.includes(feature.properties.datasetId);
    })
    .filter((feature) => {
      if (filters[feature.properties.datasetId]) {
        return isFilterMatch(feature, filters[feature.properties.datasetId]);
      }
      // Always return true if dataset is unfiltered. Meaning, show everything.
      return true;
    });
}

async function loadDatasetFeature(
  sessionID: SessionID,
  datasetId: DatasetId,
  datasetConfig: DatasetConfig,
  params?: { [key: string]: any }
) {
  const cacheTimeMinutes = IS_AP
    ? datasetConfig.cacheTimeMinutes || BUURT_CACHE_TTL_1_DAY_IN_MINUTES
    : -1;
  const dataCache = fileCache(datasetId, cacheTimeMinutes);
  const features = dataCache.getKey('features');
  const filters = dataCache.getKey('filters');

  if (datasetConfig.cache !== false && features) {
    const apiData: DatasetResponse = {
      features,
    };
    if (filters) {
      apiData.filters = filters;
    }
    return Promise.resolve(apiSuccesResult(apiData));
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
    cacheTimeout: 0, // Don't cache the requests in memory
    cancelTimeout: 1000 * 60 * 3, // 3 mins
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
          if (
            feature.geometry.type === 'MultiPolygon' ||
            feature.geometry.type === 'MultiLineString'
          ) {
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

    if (datasetConfig.cache !== false) {
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

function datasetApiResult(results: ApiResponse<DatasetResponse | null>[]) {
  const errors = results
    .filter(
      (result): result is ApiErrorResponse<null> => result.status === 'ERROR'
    )
    .map((result) => ({ id: result.id, error: result.message }));

  const responses = results.filter(
    (result): result is ApiSuccessResponse<DatasetResponse> =>
      result.status === 'OK' && result.content !== null
  );

  return {
    features: responses.flatMap((response) => response.content.features),
    filters: Object.fromEntries(
      responses.map((response) => [response.id, response.content.filters])
    ) as DatasetFilterSelection,
    errors,
  };
}

export async function loadDatasetFeatures(
  sessionID: SessionID,
  configs: Array<[string, DatasetConfig]>
) {
  type ApiDatasetResponse = ApiResponse<DatasetResponse | null>;
  const requests: Array<Promise<ApiDatasetResponse>> = [];

  for (const datasetConfig of configs) {
    const [id, config] = datasetConfig;
    requests.push(
      loadDatasetFeature(sessionID, id, config).then((result) => {
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
  { datasetIds, bbox }: { datasetIds: string[]; bbox: any }
) {
  const configs = getDatasetEndpointConfig(datasetIds, [
    'MultiPolygon',
    'MultiLineString',
  ]);
  type ApiDatasetResponse = ApiResponse<DatasetResponse | null>;
  const requests: Array<Promise<ApiDatasetResponse>> = [];

  const filterParams = {
    FILTER: `<Filter><BBOX><gml:Envelope srsName="EPSG:4326"><gml:lowerCorner>${bbox[0]} ${bbox[1]}</gml:lowerCorner><gml:upperCorner>${bbox[2]} ${bbox[3]}</gml:upperCorner></gml:Envelope></BBOX></Filter>`,
  };

  for (const datasetConfig of configs) {
    const [id, config] = datasetConfig;
    requests.push(
      loadDatasetFeature(sessionID, id, config, filterParams).then((result) => {
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
