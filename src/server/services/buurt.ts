import {
  CITY_LAYERS_CONFIG,
  CITY_ZOOM,
  DEFAULT_LAT,
  DEFAULT_LNG,
  HOOD_LAYERS_CONFIG,
  HOOD_ZOOM,
  LOCATION_ZOOM,
} from '../../universal/config';
import { apiSuccesResult } from '../../universal/helpers';
import { fetchHOME } from './home';
import { requestData } from '../helpers/source-api-request';
import { DataRequestConfig } from '../config';
import { apiErrorResult } from '../../universal/helpers/api';

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

export type DatasetItemTuple = [number, number, string];

function transformAfvalcontainers(WFSData: any) {
  const collection: Record<string, DatasetItemTuple[]> = {};
  for (const feature of WFSData.features) {
    const fractieOmschrijving = feature.properties?.fractie_omschrijving.toLowerCase();
    if (!collection[fractieOmschrijving]) {
      collection[fractieOmschrijving] = [];
    }
    if (feature?.geometry?.coordinates) {
      const [lng, lat] = feature.geometry.coordinates;
      collection[fractieOmschrijving].push([lat, lng, feature.properties.id]);
    }
  }
  return {
    id: 'afvalcontainers',
    collection,
  };
}

function transformAfvalcontainersDetail(responseData: any) {
  return responseData;
}

function transformEvenementen(WFSData: any) {
  const collection: Record<string, DatasetItemTuple[]> = { evenementen: [] };
  for (const feature of WFSData.features) {
    if (feature?.geometry?.coordinates) {
      const [lng, lat] = feature.geometry.coordinates;
      collection.evenementen.push([lat, lng, feature.properties.id]);
    }
  }

  return {
    id: 'evenementen',
    collection,
  };
}

function transformEvenementenDetail(responseData: any) {
  return responseData;
}

function transformBekendmakingen(WFSData: any) {
  const collection: Record<string, DatasetItemTuple[]> = {};
  for (const feature of WFSData.features) {
    const onderwerp = feature.properties?.onderwerp.toLowerCase();
    if (!collection[onderwerp]) {
      collection[onderwerp] = [];
    }
    if (feature?.geometry?.coordinates) {
      const [lng, lat] = feature.geometry.coordinates;
      collection[onderwerp].push([lat, lng, feature.properties.ogc_fid]);
    }
  }

  return {
    id: 'bekendmakingen',
    collection,
  };
}

function transformBekendmakingenDetail(responseData: any) {
  return responseData;
}

function transformParkeerzones(WFSData: any) {}

function transformParkeerzonesUitzonderingen(WFSData: any) {}

interface DatasetConfig {
  listUrl: string;
  detailUrl: string;
  transformList?: (data: any) => any;
  transformDetail?: (data: any) => any;
}

export const datasetEndpoints: Record<string, DatasetConfig> = {
  afvalcontainers: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/wfs/huishoudelijkafval/?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=container&OUTPUTFORMAT=geojson&SRSNAME=urn:ogc:def:crs:EPSG::4326',
    detailUrl: 'https://api.data.amsterdam.nl/v1/huishoudelijkafval/container/',
    transformList: transformAfvalcontainers,
    transformDetail: transformAfvalcontainersDetail,
  },
  evenementen: {
    listUrl:
      'https://map.data.amsterdam.nl/maps/evenementen?REQUEST=GetFeature&SERVICE=wfs&VERSION=2.0.0&TYPENAMES=evenementen&outputFormat=application/json;%20subtype=geojson;%20charset=utf-8&SRSNAME=urn:ogc:def:crs:EPSG::4326',
    detailUrl: 'https://api.data.amsterdam.nl/vsd/evenementen/',
    transformList: transformEvenementen,
    transformDetail: transformEvenementenDetail,
  },
  bekendmakingen: {
    listUrl:
      'https://map.data.amsterdam.nl/maps/bekendmakingen?REQUEST=GetFeature&SERVICE=wfs&VERSION=2.0.0&TYPENAMES=ms:bekendmakingen&outputFormat=application/json;%20subtype=geojson;%20charset=utf-8&SRSNAME=urn:ogc:def:crs:EPSG::4326',
    detailUrl: 'https://api.data.amsterdam.nl/vsd/bekendmakingen/',
    transformList: transformBekendmakingen,
    transformDetail: transformBekendmakingenDetail,
  },
  parkeerzones: {
    listUrl: '',
    detailUrl: '',
    transformList: transformParkeerzones,
  },
  parkeerzonesUitzonderingen: {
    listUrl: '',
    detailUrl: '',
    transformList: transformParkeerzonesUitzonderingen,
  },
};

export async function loadServicesMapDatasets(sessionID: SessionID) {
  const requests = Object.entries(datasetEndpoints)
    .filter(([, config]) => !!config.listUrl)
    .map(([dataset, config]) => {
      const requestConfig: DataRequestConfig = {
        url: config.listUrl,
      };
      if (config.transformList) {
        requestConfig.transformResponse = config.transformList;
      }
      return requestData(requestConfig, sessionID, {});
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
  console.log('Requesting dataset detail', requestConfig);
  const result = await requestData(requestConfig, sessionID, {});
  console.log('Dataset detail result', result);
  return result;
}
