import Supercluster from 'supercluster';
import { DATASETS } from '../../../universal/config/buurt';
import { DataRequestConfig } from '../../config';
import { getApiEmbeddedResponse } from './helpers';
import { response } from 'express';

enum zIndexPane {
  PARKEERZONES = '650',
  PARKEERZONES_UITZONDERING = '660',
  HARDLOOPROUTE = '670',
  SPORTPARK = '680',
  SPORTVELD = '690',
}

export type DatasetFeatureProperties = {
  id: string;
  datasetId: string;
  color?: string;
  zIndex?: zIndexPane;
};

export type DatasetClusterFeatureProperties = DatasetFeatureProperties & {
  cluster?: boolean;
  point_count?: number;
};
export type MaFeature<
  G extends GeoJSON.Geometry = Exclude<
    GeoJSON.Geometry,
    GeoJSON.GeometryCollection
  >
> = GeoJSON.Feature<G, DatasetFeatureProperties>;
export type MaPointFeature = MaFeature<GeoJSON.Point>;
export type MaPolyLineFeature = MaFeature<
  GeoJSON.MultiPolygon | GeoJSON.MultiLineString
>;
export type DatasetFeatures = MaFeature[];
export type MaSuperClusterFeature =
  | Supercluster.PointFeature<DatasetClusterFeatureProperties>
  | Supercluster.ClusterFeature<DatasetClusterFeatureProperties>;

export const BUURT_CACHE_TTL_HOURS = 24;
export const BUURT_CACHE_TTL_1_DAY_IN_MINUTES = 24 * 60;
export const BUURT_CACHE_TTL_1_WEEK_IN_MINUTES =
  7 * BUURT_CACHE_TTL_1_DAY_IN_MINUTES;
export const ACCEPT_CRS_4326 = {
  'Accept-Crs': 'EPSG:4326', // Will return coordinates in [lng/lat] format
};

const CONTAINER_STATUS_ACTIVE = 1;

export interface DatasetConfig {
  datasetIds?: string[];
  listUrl?: string;
  detailUrl?: string;
  transformList?: (datasetId: string, config: DatasetConfig, data: any) => any;
  transformDetail?: (
    datasetId: string,
    config: DatasetConfig,
    data: any
  ) => any;
  requestConfig?: DataRequestConfig;
  cache?: boolean;
  cacheTimeMinutes?: number;
  featureType: 'Point' | 'MultiPolygon' | 'MultiLineString';
  zIndex?: zIndexPane;
}

export const datasetEndpoints: Record<string, DatasetConfig> = {
  afvalcontainers: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/wfs/huishoudelijkafval/?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=container&OUTPUTFORMAT=geojson&SRSNAME=urn:ogc:def:crs:EPSG::4326&FILTER=%3CFilter%3E%3CAnd%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Estatus%3C/PropertyName%3E%3CLiteral%3E1%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3COr%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E110%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E16%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E111%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E112%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E67%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E181%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E113%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3C/Or%3E%3C/And%3E%3C/Filter%3E',
    detailUrl: 'https://api.data.amsterdam.nl/v1/huishoudelijkafval/container/',
    transformList: transformAfvalcontainers,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_1_WEEK_IN_MINUTES,
  },
  evenementen: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/evenementen/evenementen/?_fields=id,geometry&page_size=1000',
    detailUrl: 'https://api.data.amsterdam.nl/v1/evenementen/evenementen/',
    transformList: transformEvenementen,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_1_DAY_IN_MINUTES,
  },
  bekendmakingen: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/bekendmakingen/bekendmakingen/?_fields=id,geometry,onderwerp&page_size=10000',
    detailUrl:
      'https://api.data.amsterdam.nl/v1/bekendmakingen/bekendmakingen/',
    transformList: transformBekendmakingen,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_1_DAY_IN_MINUTES,
  },
  parkeerzones: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/wfs/parkeerzones?service=WFS&version=2.0.0&request=GetFeature&OUTPUTFORMAT=geojson&typeName=parkeerzones&SRSNAME=urn:ogc:def:crs:EPSG::4326',
    detailUrl: 'https://api.data.amsterdam.nl/v1/parkeerzones/parkeerzones/',
    transformList: transformParkeerzoneCoords,
    featureType: 'MultiPolygon',
    cache: false,
    zIndex: zIndexPane.PARKEERZONES,
  },
  parkeerzones_uitzondering: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/wfs/parkeerzones?service=WFS&version=2.0.0&request=GetFeature&OUTPUTFORMAT=geojson&typeName=parkeerzones_uitzondering&SRSNAME=urn:ogc:def:crs:EPSG::4326',
    detailUrl:
      'https://api.data.amsterdam.nl/v1/parkeerzones/parkeerzones_uitzondering/',
    transformList: transformParkeerzoneCoords,
    featureType: 'MultiPolygon',
    cache: false,
    zIndex: zIndexPane.PARKEERZONES_UITZONDERING,
  },
  zwembad: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/sport/zwembad/?_fields=id,geometry&page_size=30',
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/zwembad/',
    transformList: transformListSportApiResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_1_WEEK_IN_MINUTES,
  },
  sportpark: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/wfs/sport?service=WFS&version=2.0.0&request=GetFeature&OUTPUTFORMAT=geojson&typeName=sportpark&SRSNAME=urn:ogc:def:crs:EPSG::4326',
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/sportpark/',
    transformList: transformListSportApiResponse,
    cache: false,
    featureType: 'MultiPolygon',
    zIndex: zIndexPane.SPORTPARK,
  },
  sportveld: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/wfs/sport?service=WFS&version=2.0.0&request=GetFeature&OUTPUTFORMAT=geojson&typeName=sportveld&SRSNAME=urn:ogc:def:crs:EPSG::4326',
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/sportveld/',
    transformList: transformListSportApiResponse,
    cache: false,
    featureType: 'MultiPolygon',
    zIndex: zIndexPane.SPORTVELD,
  },
  gymsportzaal: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/sport/gymsportzaal/?_fields=id,adres,plaats&page_size=150',
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/gymsportzaal/',
    transformList: transformListSportApiResponse,
    featureType: 'Point',
  },
  sporthal: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/sport/sporthal/?_fields=id,geometry&page_size=50',
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/sporthal/',
    transformList: transformListSportApiResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_1_WEEK_IN_MINUTES,
  },
  sportaanbieder: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/sport/sportaanbieder/?_fields=id,geometry&page_size=2000',
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/sportaanbieder/',
    transformList: transformListSportApiResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_1_WEEK_IN_MINUTES,
  },
  openbaresportplek: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/sport/openbaresportplek/?_fields=id,geometry&page_size=1000',
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/openbaresportplek/',
    transformList: transformListSportApiResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_1_WEEK_IN_MINUTES,
  },
  hardlooproute: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/wfs/sport?service=WFS&version=2.0.0&request=GetFeature&OUTPUTFORMAT=geojson&typeName=hardlooproute&SRSNAME=urn:ogc:def:crs:EPSG::4326',
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/hardlooproute/',
    transformList: transformListSportApiResponse,
    cache: false,
    featureType: 'MultiLineString',
    zIndex: zIndexPane.HARDLOOPROUTE,
  },
};

function getPolyLineColor(datasetId: string, feature: any) {
  switch (datasetId) {
    case 'sportveld':
      switch (feature.sportfunctie) {
        case 'Honkbal/softbal':
          return 'green';
        case 'Voetbal':
          return 'green';
        case 'Atletiek':
          return 'brown';
        case 'Australian football':
          return 'green';
        case 'Rugby':
          return 'green';
        case 'Handboogschieten':
          return 'green';
        case 'Golf driving range':
          return 'green';
        case 'Short golf':
          return 'green';
        case 'Cricket':
          return 'green';
        case 'Hockey':
          return 'green';
        case 'Tennis':
          return 'brown';
        case 'Golf':
          return 'green';
        case 'Balspel':
          return 'green';
        case 'Honkbal':
          return 'green';
        case 'Handbal':
          return 'green';
        case 'Korfbal':
          return 'green';
        case 'Beachvolleybal':
          return 'green';
        case 'Jeu de Boules':
          return '#ccc';
        case 'Beachhandbal':
          return 'sand';
        case 'Basketbal':
          return '#555';
        case 'Skaten':
          return '#555';
        case 'Wielrennen':
          return '#ccc';
        case 'Padel':
          return 'green';
        case 'American football':
          return 'green';
        default:
          return 'purple';
      }
    case 'sportpark':
      return 'green';
    case 'hardlooproute':
      return 'purple';
    default:
      return 'purple';
  }
}

function transformListSportApiResponse(
  datasetId: string,
  config: DatasetConfig,
  responseData: any
) {
  const results = responseData?.features
    ? responseData?.features
    : getApiEmbeddedResponse(datasetId, responseData);
  const collection: DatasetFeatures = [];

  if (results && results.length) {
    for (const feature of results) {
      if (feature.geometry?.coordinates) {
        const properties: DatasetFeatureProperties = {
          id: feature?.properties?.id || feature.id,
          datasetId,
        };
        if (
          feature.geometry.type === 'MultiPolygon' ||
          feature.geometry.type === 'MultiLineString'
        ) {
          properties.color = getPolyLineColor(datasetId, feature);
          if (config?.zIndex) {
            properties.zIndex = config.zIndex;
          }
        }
        collection.push({
          type: 'Feature',
          geometry: feature.geometry,
          properties,
        });
      }
    }
  }

  return collection;
}

function transformAfvalcontainers(
  datasetId: string,
  config: DatasetConfig,
  WFSData: any
) {
  const collection: DatasetFeatures = [];
  if (Array.isArray(WFSData?.features)) {
    for (const feature of WFSData.features) {
      const fractieOmschrijving = feature.properties?.fractie_omschrijving.toLowerCase();
      // Redundant filtering, the API should return with the proper dataset already
      if (
        feature.properties?.status === CONTAINER_STATUS_ACTIVE &&
        DATASETS.afvalcontainers.includes(fractieOmschrijving)
      ) {
        if (feature?.geometry?.coordinates) {
          collection.push({
            type: 'Feature',
            geometry: feature.geometry,
            properties: {
              id: feature.properties.id,
              datasetId: fractieOmschrijving,
            },
          });
        }
      }
    }
  }
  return collection;
}

function transformEvenementen(
  datasetId: string,
  config: DatasetConfig,
  responseData: any
) {
  const results = getApiEmbeddedResponse('evenementen', responseData);
  const collection: DatasetFeatures = [];
  if (results && results.length) {
    for (const feature of results) {
      if (feature?.geometry?.coordinates) {
        collection.push({
          type: 'Feature',
          geometry: feature.geometry,
          properties: {
            id: feature.id,
            datasetId: 'evenementen',
          },
        });
      }
    }
  }
  return collection;
}

function transformBekendmakingen(
  datasetId: string,
  config: DatasetConfig,
  responseData: any
) {
  const results = getApiEmbeddedResponse('bekendmakingen', responseData);
  const collection: DatasetFeatures = [];

  if (results && results.length) {
    for (const feature of results) {
      const datasetId = feature?.onderwerp.toLowerCase();

      if (feature?.geometry?.coordinates) {
        collection.push({
          type: 'Feature',
          geometry: feature.geometry,
          properties: {
            id: feature.id,
            datasetId,
          },
        });
      }
    }
  }
  return collection;
}

function transformParkeerzoneCoords(
  datasetId: string,
  config: DatasetConfig,
  responseData: any
) {
  const results = responseData?.features;
  const collection: DatasetFeatures = [];

  if (results && results.length) {
    for (const feature of results) {
      collection.push({
        type: 'Feature',
        geometry: feature.geometry,
        properties: {
          id: feature?.properties?.id || feature.id,
          datasetId,
          color: feature.properties.gebiedskleurcode,
        },
      });
    }
  }
  return collection;
}
