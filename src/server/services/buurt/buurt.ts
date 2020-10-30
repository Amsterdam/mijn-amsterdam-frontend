import {
  CITY_LAYERS_CONFIG,
  CITY_ZOOM,
  DEFAULT_LAT,
  DEFAULT_LNG,
  HOOD_LAYERS_CONFIG,
  HOOD_ZOOM,
  LOCATION_ZOOM,
} from '../../../universal/config';
import { apiErrorResult, apiSuccesResult } from '../../../universal/helpers';
import { ApiResponse } from '../../../universal/helpers/api';
import { DataRequestConfig } from '../../config';
import { requestData } from '../../helpers';
import FileCache from '../../helpers/file-cache';
import { fetchHOME } from '../home';
import {
  ACCEPT_CRS_4326,
  BUURT_CACHE_TTL_HOURS,
  DatasetCollection,
  DatasetConfig,
  MaPointFeature,
  MaPolyLineFeature,
} from './datasets';
import { getDatasetEndpointConfig, recursiveCoordinateSwap } from './helpers';

const MAP_URL =
  'https://data.amsterdam.nl/data/?modus=kaart&achtergrond=topo_rd_zw&embed=true';

export function getEmbedUrl(latlng: LatLngObject | null) {
  let lat = DEFAULT_LAT;
  let lng = DEFAULT_LNG;

  let embed = {
    advanced: `${MAP_URL}&center=${lat}%2C${lng}&zoom=${CITY_ZOOM}&${CITY_LAYERS_CONFIG}&legenda=true`,
    simple: `${MAP_URL}&center=${lat}%2C${lng}&zoom=${CITY_ZOOM}`,
  };

  if (latlng && latlng.lat && latlng.lng) {
    lat = latlng.lat;
    lng = latlng.lng;

    embed = {
      advanced: `${MAP_URL}&center=${lat}%2C${lng}&zoom=${HOOD_ZOOM}&marker=${lat}%2C${lng}&${HOOD_LAYERS_CONFIG}&legenda=true&marker-icon=home`,
      simple: `${MAP_URL}&center=${lat}%2C${lng}&zoom=${LOCATION_ZOOM}&marker=${lat}%2C${lng}&marker-icon=home`,
    };
  }

  return embed;
}

export async function fetchBUURT(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>,
  profileType: ProfileType
) {
  const HOME = await fetchHOME(
    sessionID,
    passthroughRequestHeaders,
    profileType
  );
  return apiSuccesResult({
    embed: getEmbedUrl(HOME.content?.latlng || null),
  });
}

// Development and e2e testing will always serve cached file
const isMockAdapterEnabled = !process.env.BFF_DISABLE_MOCK_ADAPTER;

const fileCaches: Record<string, FileCache> = {};

const fileCache = (id: string) => {
  if (!fileCaches[id]) {
    fileCaches[id] = new FileCache({
      name: `./buurt/${id}.flat-cache.json`,
      cacheTimeMinutes: isMockAdapterEnabled ? 0 : BUURT_CACHE_TTL_HOURS * 60, // 24 hours
    });
  }
  return fileCaches[id];
};

async function loadDataset(
  sessionID: SessionID,
  datasetId: string,
  datasetConfig: DatasetConfig
) {
  const dataCache = fileCache(datasetId);
  const apiData = dataCache.getKey('response');

  if (apiData) {
    return Promise.resolve(apiData);
  }

  const requestConfig: DataRequestConfig = {
    url: datasetConfig.listUrl,
    cacheTimeout: 0, // Don't cache the requests in memory
    cancelTimeout: 1000 * 60 * 3, // 3 mins
  };

  requestConfig.headers = ACCEPT_CRS_4326;

  if (datasetConfig.transformList) {
    requestConfig.transformResponse = datasetConfig.transformList;
  }

  const response = await requestData<DatasetCollection>(
    requestConfig,
    sessionID,
    {}
  );

  if (Array.isArray(response.content)) {
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
  }

  if (response.status === 'OK' && response.content !== null) {
    dataCache.setKey('url', datasetConfig.listUrl);
    dataCache.setKey('response', response);
    dataCache.save();
  }

  return response;
}

async function loadDatasets(
  sessionID: SessionID,
  configs: Array<[string, DatasetConfig]>
) {
  const requests: Array<Promise<ApiResponse<DatasetCollection>>> = [];

  for (const datasetConfig of configs) {
    const [id, config] = datasetConfig;
    requests.push(loadDataset(sessionID, id, config));
  }

  const results = await Promise.all(requests);
  const datasetResults = results.flatMap(({ content }) => content);
  const features = datasetResults.filter(
    (result): result is MaPointFeature | MaPolyLineFeature => result !== null
  );
  return features;
}

export async function loadServicesMapDatasets(
  sessionID: SessionID,
  datasetId?: string
) {
  const configs = getDatasetEndpointConfig(datasetId);

  if (!configs.length) {
    return apiErrorResult('Could not find dataset', null);
  }

  const dataStore = await loadDatasets(sessionID, configs);
  let response = dataStore;

  if (datasetId) {
    response = dataStore.filter(
      (feature) => feature?.properties.datasetId === datasetId
    );
  }

  return apiSuccesResult(response);
}

export async function loadServicesMapDatasetItem(
  sessionID: SessionID,
  datasetId: string,
  id: string
) {
  const [datasetConfig] = getDatasetEndpointConfig(datasetId);

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
    requestConfig.transformResponse = config.transformDetail;
  }

  return requestData(requestConfig, sessionID, {});
}

export async function loadPolyLineDatasets(
  sessionID: SessionID,
  datasetIds?: string[]
) {
  const dataStore = (await loadServicesMapDatasets(sessionID)).content;

  if (!dataStore) {
    return [];
  }

  return dataStore.filter((feature, index): feature is MaPolyLineFeature => {
    return (
      (feature.geometry.type === 'MultiPolygon' ||
        feature.geometry.type === 'MultiLineString') &&
      (!datasetIds || datasetIds.includes(feature.properties.datasetId))
    );
  });
}
