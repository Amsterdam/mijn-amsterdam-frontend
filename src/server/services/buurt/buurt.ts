import { apiErrorResult, apiSuccesResult } from '../../../universal/helpers';
import { ApiResponse } from '../../../universal/helpers/api';
import { DataRequestConfig } from '../../config';
import { requestData } from '../../helpers';
import FileCache from '../../helpers/file-cache';
import {
  ACCEPT_CRS_4326,
  BUURT_CACHE_TTL_HOURS,
  DatasetConfig,
  DatasetFeatures,
  MaPointFeature,
  MaPolyLineFeature,
} from './datasets';
import { getDatasetEndpointConfig, recursiveCoordinateSwap } from './helpers';

// Development and e2e testing will always serve cached file
const isMockAdapterEnabled = !process.env.BFF_DISABLE_MOCK_ADAPTER;

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

export function filterDatasetFeatures(
  features: DatasetFeatures,
  activeDatasetIds: string[]
) {
  return features.filter((feature, index): feature is MaPointFeature => {
    return activeDatasetIds.includes(feature.properties.datasetId);
  });
}

async function loadDatasetFeature(
  sessionID: SessionID,
  datasetId: string,
  datasetConfig: DatasetConfig,
  params?: { [key: string]: any }
) {
  const cacheTimeMinutes =
    datasetConfig.cacheTimeMinutes || BUURT_CACHE_TTL_HOURS * 60;
  const dataCache = fileCache(
    datasetId,
    isMockAdapterEnabled ? -1 : cacheTimeMinutes
  );
  const apiData = dataCache.getKey('response');

  if (datasetConfig.cache !== false && apiData) {
    return Promise.resolve(apiData);
  }
  const config = { ...(datasetConfig.requestConfig || {}) };

  if (params) {
    config.params = {
      ...(config.params || {}),
      ...params,
    };
  }

  const requestConfig: DataRequestConfig = {
    url: datasetConfig.listUrl,
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

  if (response.status === 'OK' && Array.isArray(response.content)) {
    response.content = response.content.map((feature) => {
      if (
        feature.geometry.type === 'MultiPolygon' ||
        feature.geometry.type === 'MultiLineString'
      ) {
        feature.geometry.coordinates = recursiveCoordinateSwap(
          feature.geometry.coordinates
        );
      }
      return feature;
    });

    if (datasetConfig.cache !== false) {
      dataCache.setKey('url', datasetConfig.listUrl);
      dataCache.setKey('response', response);
      dataCache.save();
    }
  }

  return response;
}

export async function loadDatasetFeatures(
  sessionID: SessionID,
  configs: Array<[string, DatasetConfig]>
) {
  type ApiDatasetResponse = ApiResponse<DatasetFeatures>;
  const requests: Array<Promise<ApiDatasetResponse>> = [];

  for (const datasetConfig of configs) {
    const [id, config] = datasetConfig;
    requests.push(
      loadDatasetFeature(sessionID, id, config).then(
        (result: ApiDatasetResponse) => {
          return {
            ...result,
            id,
          };
        }
      )
    );
  }

  const results = await Promise.all(requests);
  const errorResults = results.filter((result) => result.status === 'ERROR');
  const features = results
    .filter((result) => result.status === 'OK')
    .flatMap((result) => result.content)
    .filter(
      (result): result is MaPointFeature | MaPolyLineFeature => result !== null
    );

  return apiSuccesResult({ features, errorResults });
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

export async function loadPolyLineFeatures(
  sessionID: SessionID,
  { datasetIds, bbox }: { datasetIds: string[]; bbox: any }
) {
  const configs = getDatasetEndpointConfig(datasetIds, [
    'MultiPolygon',
    'MultiLineString',
  ]);
  type ApiDatasetResponse = ApiResponse<DatasetFeatures>;
  const requests: Array<Promise<ApiDatasetResponse>> = [];

  const filterParams = {
    FILTER: `<Filter><BBOX><gml:Envelope srsName="EPSG:4326"><gml:lowerCorner>${bbox[0]} ${bbox[1]}</gml:lowerCorner><gml:upperCorner>${bbox[2]} ${bbox[3]}</gml:upperCorner></gml:Envelope></BBOX></Filter>`,
  };

  for (const datasetConfig of configs) {
    const [id, config] = datasetConfig;
    requests.push(
      loadDatasetFeature(sessionID, id, config, filterParams).then(
        (result: ApiDatasetResponse) => {
          return {
            ...result,
            id,
          };
        }
      )
    );
  }

  const results = await Promise.all(requests);
  const errorResults = results.filter((result) => result.status === 'ERROR');
  const datasetResults = results.flatMap(({ content }) => content);
  const features = datasetResults.filter(
    (result): result is MaPolyLineFeature => result !== null
  );
  return { errorResults, features };
}
