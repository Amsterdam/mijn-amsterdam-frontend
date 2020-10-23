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
import { ACCEPT_CRS_4326, DatasetConfig, datasetEndpoints } from './datasets';
import { getDatasetEndpointConfig } from './helpers';

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
      cacheTime: isMockAdapterEnabled ? 0 : 24 * 60, // 24 hours
    });
  }
  return fileCaches[id];
};

function loadDataset(
  sessionID: SessionID,
  datasetId: string,
  datasetConfig: DatasetConfig
): Promise<ApiResponse<any>> {
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

  return requestData(requestConfig, sessionID, {}).then((response) => {
    if (response.status === 'OK' && response.content !== null) {
      dataCache.setKey('url', datasetConfig.listUrl);
      dataCache.setKey('response', response);
      dataCache.save();
    }
    return response;
  });
}

function loadDatasets(
  sessionID: SessionID,
  configs: Array<[string, DatasetConfig]>
) {
  const requests: Array<Promise<
    ApiResponse<{
      id: string;
      collection: Record<string, any>;
    }>
  >> = [];

  for (const datasetConfig of configs) {
    const [id, config] = datasetConfig;
    let request = null;
    if (config.multi) {
      const configsMulti = Object.entries(config.multi);
      request = loadDatasets(sessionID, configsMulti).then((results) => {
        const collection = results.reduce((acc, result: any) => {
          // Aggregate all api results into 1
          return Object.assign(acc, {
            [result.id]: result.collection,
          });
        }, {});
        return apiSuccesResult({
          id,
          collection,
        });
      });
    } else if (config.listUrl) {
      request = loadDataset(sessionID, id, config);
    }

    if (request) {
      requests.push(request);
    }
  }

  return Promise.all(requests).then((datasetResults) =>
    datasetResults
      .filter(({ content }) => content !== null)
      .map(({ content }) => content)
  );
}

export async function loadServicesMapDatasets(
  sessionID: SessionID,
  datasetGroupId?: string,
  datasetId?: string
) {
  const configs = getDatasetEndpointConfig(datasetGroupId, datasetId).filter(
    ([id, config]) => {
      // Exclude the noCluster datasets if no dataset specs are given. Initially we return only clusterable datasets.
      return !datasetGroupId ? config.noCluster !== true : true;
    }
  );

  if (!configs.length) {
    return apiErrorResult('Could not find dataset', null);
  }
  const datasetResults = await loadDatasets(sessionID, configs);

  // Dive into the dataset and retrieve the appropriate collection item
  // TODO: skip this operation for multi datasets
  if (datasetGroupId && datasetId) {
    const [datasetResult] = datasetResults;
    if (datasetResult?.collection && datasetResult.collection[datasetId]) {
      datasetResult.collection = {
        [datasetId]: datasetResult.collection[datasetId],
      };
      return apiSuccesResult(datasetResults);
    }
    return apiErrorResult('Could not find dataset', null);
  }

  return apiSuccesResult(datasetResults);
}

export async function loadServicesMapDatasetItem(
  sessionID: SessionID,
  datasetGroupId: string,
  datasetId: string,
  datasetItemId: string
) {
  const [datasetConfig] = getDatasetEndpointConfig(datasetGroupId, datasetId);

  if (!datasetConfig) {
    return apiErrorResult(`Unknown dataset ${datasetId}`, null);
  }

  const [, config] = datasetConfig;

  const requestConfig: DataRequestConfig = {
    url: `${config.detailUrl}${datasetItemId}`,
  };

  requestConfig.headers = ACCEPT_CRS_4326;

  if (config.transformDetail) {
    requestConfig.transformResponse = config.transformDetail;
  }

  return requestData(requestConfig, sessionID, {});
}
