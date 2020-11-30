import { LatLngTuple } from 'leaflet';
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

export function isCoordWithingBoundingBox(
  bbox: [number, number, number, number],
  coords: LatLngTuple[]
) {
  const [x1, y1, x2, y2] = bbox;
  let i = 0;
  let len = coords.length;
  for (i; i < len; i += 1) {
    const y = coords[i][0];
    const x = coords[i][1];
    if (x1 <= x && x <= x2 && y1 <= y && y <= y2) {
      return true;
    }
  }
  return false;
}

export function filterPolylineFeaturesWithinBoundingBox(
  features: MaFeature[],
  bbox: [number, number, number, number]
) {
  const featuresFiltered = [];
  const hasCoord = (coords: any) => isCoordWithingBoundingBox(bbox, coords);

  let i = 0;
  let len = features.length;

  for (i; i < len; i += 1) {
    if (features[i].geometry.coordinates.flat().some(hasCoord)) {
      featuresFiltered.push(features[i]);
    }
  }

  return featuresFiltered;
}

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
  // const filters: DatasetPropertyFilter = {};
  const propertyNames = Object.keys(filterConfig);

  const filters: DatasetPropertyFilter = {};

  for (const feature of features) {
    for (const propertyName of propertyNames) {
      // Get property value from object.filters or from object itself
      const value =
        (feature?.properties || feature)[propertyName] ||
        filterConfig[propertyName].emptyValue ||
        'EMPTY_VALUE';
      if (!filters[propertyName]) {
        filters[propertyName] = {
          values: {},
        };
      }
      const values = filters[propertyName].values;
      values[value] = (values[value] || 0) + 1;
      filters[propertyName].values = values;
    }
  }

  return filters;
}

// Matches feature properties to requested filters
function isFilterMatch(feature: MaFeature, filters: DatasetPropertyFilter) {
  return Object.entries(filters).every(([propertyName, valueConfig]) => {
    const propertyValues = valueConfig.values;
    return (
      !Object.keys(propertyValues).length ||
      (propertyName in feature.properties &&
        feature.properties[propertyName] in propertyValues)
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

async function fetchDataset(
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
  const configs = getDatasetEndpointConfig(datasetIds, [
    'MultiPolygon',
    'MultiLineString',
  ]);
  type ApiDatasetResponse = ApiResponse<DatasetResponse | null>;
  const requests: Array<Promise<ApiDatasetResponse>> = [];

  // TODO: Determine if we should use the WFS server for live querying
  // const filterQuery = (query: string = '') => {
  //   return `
  //     <Filter>
  //       <And>
  //         <BBOX>
  //           <gml:Envelope srsName="EPSG:4326">
  //             <gml:lowerCorner>${bbox[0]} ${bbox[1]}</gml:lowerCorner>
  //             <gml:upperCorner>${bbox[2]} ${bbox[3]}</gml:upperCorner>
  //           </gml:Envelope>
  //         </BBOX>
  //         ${query}
  //       </And>
  //     </Filter>`;
  // };

  for (const datasetConfig of configs) {
    const [datasetId, config] = datasetConfig;
    //   const filterParams = { FILTER: filterQuery() };

    //   if (filters && filters[datasetId]) {
    //     const filterBlocks = [];

    //     for (const [propertyName, { values }] of Object.entries(
    //       filters[datasetId]
    //     )) {
    //       if (!values.length) {
    //         continue;
    //       }

    //       const block = values
    //         .map((value) => {
    //           return `
    //           <PropertyIsEqualTo>
    //             <PropertyName>${propertyName}</PropertyName>
    //             <Literal>${value}</Literal>
    //           </PropertyIsEqualTo>
    //         `;
    //         })
    //         .join('\n');

    //       filterBlocks.push(block);
    //     }

    //     filterParams.FILTER = filterBlocks.length
    //       ? filterQuery(`<Or>${filterBlocks.join('</Or><Or>')}</Or>`)
    //       : filterParams.FILTER;
    //   }

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

  const featuresFiltered = filterDatasetFeatures(
    featuresWithinBoundingbox,
    datasetIds,
    filters
  );

  return {
    ...result,
    features: featuresFiltered,
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
