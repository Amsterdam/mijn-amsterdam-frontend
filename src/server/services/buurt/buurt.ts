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
import { ApiResponse, getSettledResult } from '../../../universal/helpers/api';
import { DataRequestConfig } from '../../config';
import { requestData } from '../../helpers';
import FileCache from '../../helpers/file-cache';
import { fetchHOME } from '../home';
import {
  ACCEPT_CRS_4326,
  BUURT_CACHE_TTL_HOURS,
  DatasetConfig,
  DatasetFeatures,
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

const fileCache = (id: string, cacheTimeMinutes: number) => {
  if (!fileCaches[id]) {
    fileCaches[id] = new FileCache({
      name: `./buurt/${id}.flat-cache.json`,
      cacheTimeMinutes,
    });
  }
  return fileCaches[id];
};

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

  if (
    datasetConfig.cache !== false &&
    response.status === 'OK' &&
    response.content !== null
  ) {
    dataCache.setKey('url', datasetConfig.listUrl);
    dataCache.setKey('response', response);
    dataCache.save();
  }

  return response;
}

export async function loadDatasetFeatures(
  sessionID: SessionID,
  configs: Array<[string, DatasetConfig]>
) {
  const requests: Array<Promise<ApiResponse<DatasetFeatures>>> = [];

  for (const datasetConfig of configs) {
    const [id, config] = datasetConfig;
    requests.push(loadDatasetFeature(sessionID, id, config));
  }

  const results = await Promise.allSettled(requests);

  const datasetResults = results.flatMap(
    (result) => getSettledResult(result).content || []
  );

  const features = datasetResults.filter(
    (result): result is MaPointFeature | MaPolyLineFeature => result !== null
  );

  return apiSuccesResult(features);
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
  const requests: Array<Promise<ApiResponse<DatasetFeatures>>> = [];
  const filterParams = {
    FILTER: `<Filter><BBOX><gml:Envelope srsName="EPSG:4326"><gml:lowerCorner>${bbox[0]} ${bbox[1]}</gml:lowerCorner><gml:upperCorner>${bbox[2]} ${bbox[3]}</gml:upperCorner></gml:Envelope></BBOX></Filter>`,
  };

  for (const datasetConfig of configs) {
    const [id, config] = datasetConfig;
    requests.push(loadDatasetFeature(sessionID, id, config, filterParams));
  }

  const results = await Promise.all(requests);
  const datasetResults = results.flatMap(({ content }) => content);
  const features = datasetResults.filter(
    (result): result is MaPolyLineFeature => result !== null
  );
  return features;

  // return dataStore.filter((feature, index): feature is MaPolyLineFeature => {
  //   return (
  //     (feature.geometry.type === 'MultiPolygon' ||
  //       feature.geometry.type === 'MultiLineString') &&
  //     (!datasetIds || datasetIds.includes(feature.properties.datasetId))
  //   );
  // });
}
