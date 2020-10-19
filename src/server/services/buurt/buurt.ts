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
import { DataRequestConfig } from '../../config';
import { requestData } from '../../helpers';
import FileCache from '../../helpers/file-cache';
import { fetchHOME } from '../home';
import { datasetEndpoints } from './datasets';

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

const fileCache = new FileCache({
  name: 'buurt-datasets.flat-cache.json',
  cacheTime: isMockAdapterEnabled ? 0 : 24 * 60, // 24 hours
});

export async function loadServicesMapDatasets(sessionID: SessionID) {
  const requests = Object.entries(datasetEndpoints)
    .filter(([, config]) => !!config.listUrl)
    .map(([apiName, config]) => {
      const apiData = fileCache.getKey(apiName);
      if (apiData) {
        return Promise.resolve(apiData);
      }
      const requestConfig: DataRequestConfig = {
        url: config.listUrl,
        cacheTimeout: 0,
      };
      if (config.transformList) {
        requestConfig.transformResponse = config.transformList;
      }
      return requestData(requestConfig, sessionID, {}).then(apiData => {
        fileCache.setKey(apiName, apiData);
        fileCache.save();
        return apiData;
      });
    });

  const datasets = await Promise.all(requests);
  return apiSuccesResult(datasets.map(({ content }) => content));
}

export async function loadServicesMapDatasetItem(
  sessionID: SessionID,
  dataset: string,
  id: string
) {
  const config = datasetEndpoints[dataset];
  if (!config) {
    return apiErrorResult(`Unknown dataset ${dataset}`, null);
  }
  const requestConfig: DataRequestConfig = {
    url: `${config.detailUrl}${id}`,
  };
  if (config.transformDetail) {
    requestConfig.transformResponse = config.transformDetail;
  }

  return requestData(requestConfig, sessionID, {});
}
