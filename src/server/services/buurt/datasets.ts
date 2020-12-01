import Supercluster from 'supercluster';
import {
  DatasetPropertyFilter,
  DatasetId,
  DatasetPropertyValue,
  DATASETS,
  getDatasetCategoryId,
} from '../../../universal/config/buurt';
import { DataRequestConfig } from '../../config';
import { getApiEmbeddedResponse } from './helpers';
import {
  DatasetCategoryId,
  DatasetPropertyName,
} from '../../../universal/config/buurt';

enum zIndexPane {
  PARKEERZONES = '650',
  PARKEERZONES_UITZONDERING = '660',
  HARDLOOPROUTE = '670',
  SPORTPARK = '680',
  SPORTVELD = '690',
}

export type DatasetFeatureProperties = {
  id: string;
  datasetId: DatasetId;
  color?: string;
  zIndex?: zIndexPane;
  [propertyName: string /*DatasetPropertyName*/]: DatasetPropertyValue | any;
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
export type MaPolylineFeature = MaFeature<
  GeoJSON.MultiPolygon | GeoJSON.MultiLineString
>;
export type DatasetFeatures = MaFeature[];
export type MaSuperClusterFeature =
  | Supercluster.PointFeature<DatasetClusterFeatureProperties>
  | Supercluster.ClusterFeature<DatasetClusterFeatureProperties>;

export type DatasetResponse = {
  features: DatasetFeatures;
  filters?: DatasetPropertyFilter;
};

export const BUURT_CACHE_TTL_HOURS = 24;
export const BUURT_CACHE_TTL_1_DAY_IN_MINUTES = 24 * 60;
export const BUURT_CACHE_TTL_1_WEEK_IN_MINUTES =
  7 * BUURT_CACHE_TTL_1_DAY_IN_MINUTES;
export const ACCEPT_CRS_4326 = {
  'Accept-Crs': 'EPSG:4326', // Will return coordinates in [lng/lat] format
};

const CONTAINER_STATUS_ACTIVE = 1;

export interface DatasetConfig {
  datasetIds?: DatasetId[];
  listUrl?: string | ((config: DatasetConfig) => string);
  detailUrl?: string;
  transformList?: (
    datasetId: DatasetId,
    config: DatasetConfig,
    data: any
  ) => any;
  transformDetail?: (
    datasetId: DatasetId,
    config: DatasetConfig,
    data: any
  ) => any;
  requestConfig?: DataRequestConfig;
  cache?: boolean;
  cacheTimeMinutes?: number;
  featureType: 'Point' | 'MultiPolygon' | 'MultiLineString';
  zIndex?: zIndexPane;
  additionalStaticPropertyNames?: DatasetPropertyName[];
}

function getFilterPropertyNames(datasetId: DatasetId) {
  const datasetCategoryId = getDatasetCategoryId(datasetId);

  if (!datasetCategoryId) {
    return;
  }
  const propertyFilters =
    DATASETS[datasetCategoryId].datasets[datasetId]?.filters;

  return propertyFilters && Object.keys(propertyFilters);
}

function dsoApiListUrl(dataset: string, pageSize: number = 1000) {
  const [datasetCategoryId, datasetId] = dataset.split('/');
  const apiUrl = `https://api.data.amsterdam.nl/v1/${datasetCategoryId}/${datasetId}/?_fields=id,geometry`;
  const pageSizeParam = `&page_size=${pageSize}`;

  return (datasetConfig: DatasetConfig) => {
    const propertyNames = getFilterPropertyNames(datasetId) || [];

    if (datasetConfig.additionalStaticPropertyNames) {
      propertyNames.push(...datasetConfig.additionalStaticPropertyNames);
    }

    return (
      apiUrl +
      (propertyNames.length ? ',' + propertyNames.join(',') : '') +
      pageSizeParam
    );
  };
}

export const datasetEndpoints: Record<
  DatasetId | DatasetCategoryId,
  DatasetConfig
> = {
  afvalcontainers: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/wfs/huishoudelijkafval/?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=container&OUTPUTFORMAT=geojson&SRSNAME=urn:ogc:def:crs:EPSG::4326&FILTER=%3CFilter%3E%3CAnd%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Estatus%3C/PropertyName%3E%3CLiteral%3E1%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3COr%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E110%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E16%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E111%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E112%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E67%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E181%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E113%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3C/Or%3E%3C/And%3E%3C/Filter%3E',
    detailUrl: 'https://api.data.amsterdam.nl/v1/huishoudelijkafval/container/',
    transformList: transformDsoApiListResponse,
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
    listUrl: dsoApiListUrl('bekendmakingen/bekendmakingen'),
    detailUrl:
      'https://api.data.amsterdam.nl/v1/bekendmakingen/bekendmakingen/',
    transformList: transformDsoApiListResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_1_DAY_IN_MINUTES,
  },
  parkeerzones: {
    listUrl: dsoApiListUrl('parkeerzones/parkeerzones'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/parkeerzones/parkeerzones/',
    transformList: transformParkeerzoneCoords,
    featureType: 'MultiPolygon',
    zIndex: zIndexPane.PARKEERZONES,
    additionalStaticPropertyNames: ['gebiedskleurcode'],
    cacheTimeMinutes: BUURT_CACHE_TTL_1_WEEK_IN_MINUTES,
  },
  parkeerzones_uitzondering: {
    listUrl: dsoApiListUrl('parkeerzones/parkeerzones_uitzondering'),
    detailUrl:
      'https://api.data.amsterdam.nl/v1/parkeerzones/parkeerzones_uitzondering/',
    transformList: transformParkeerzoneCoords,
    featureType: 'MultiPolygon',
    zIndex: zIndexPane.PARKEERZONES_UITZONDERING,
    cacheTimeMinutes: BUURT_CACHE_TTL_1_WEEK_IN_MINUTES,
  },
  zwembad: {
    listUrl: dsoApiListUrl('sport/zwembad'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/zwembad/',
    transformList: transformDsoApiListResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_1_WEEK_IN_MINUTES,
  },
  sportpark: {
    listUrl: dsoApiListUrl('sport/sportpark'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/sportpark/',
    transformList: transformDsoApiListResponse,
    featureType: 'MultiPolygon',
    zIndex: zIndexPane.SPORTPARK,
    cacheTimeMinutes: BUURT_CACHE_TTL_1_WEEK_IN_MINUTES,
  },
  sportveld: {
    listUrl: dsoApiListUrl('sport/sportveld'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/sportveld/',
    transformList: transformDsoApiListResponse,
    featureType: 'MultiPolygon',
    zIndex: zIndexPane.SPORTVELD,
    cacheTimeMinutes: BUURT_CACHE_TTL_1_WEEK_IN_MINUTES,
  },
  gymsportzaal: {
    listUrl: dsoApiListUrl('sport/gymsportzaal'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/gymsportzaal/',
    transformList: transformDsoApiListResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_1_WEEK_IN_MINUTES,
  },
  sporthal: {
    listUrl: dsoApiListUrl('sport/sporthal'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/sporthal/',
    transformList: transformDsoApiListResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_1_WEEK_IN_MINUTES,
  },
  sportaanbieder: {
    listUrl: dsoApiListUrl('sport/sportaanbieder', 2000),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/sportaanbieder/',
    transformList: transformDsoApiListResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_1_WEEK_IN_MINUTES,
  },
  openbaresportplek: {
    listUrl: dsoApiListUrl('sport/openbaresportplek'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/openbaresportplek/',
    transformList: transformDsoApiListResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_1_WEEK_IN_MINUTES,
  },
  hardlooproute: {
    listUrl: dsoApiListUrl('sport/hardlooproute'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/hardlooproute/',
    transformList: transformDsoApiListResponse,
    featureType: 'MultiLineString',
    zIndex: zIndexPane.HARDLOOPROUTE,
    cacheTimeMinutes: BUURT_CACHE_TTL_1_WEEK_IN_MINUTES,
  },
};

function getPolylineColor(datasetId: DatasetId, feature: any) {
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

function addFilterProps(
  datasetId: DatasetId,
  featureProperties: MaFeature['properties'],
  featureSourceProperties: any
) {
  const filterPropertyNames = getFilterPropertyNames(datasetId);
  if (filterPropertyNames && featureSourceProperties) {
    for (const propertyName of filterPropertyNames) {
      featureProperties[propertyName] =
        (featureSourceProperties?.properties &&
          featureSourceProperties.properties[propertyName]) ||
        featureSourceProperties[propertyName];
    }
  }
  return featureProperties;
}

function transformDsoApiListResponse(
  datasetId: DatasetId,
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

        const hasShapeGeometry =
          feature.geometry.type === 'MultiPolygon' ||
          feature.geometry.type === 'MultiLineString';

        if (hasShapeGeometry) {
          properties.color = getPolylineColor(datasetId, feature);
          if (config?.zIndex) {
            properties.zIndex = config.zIndex;
          }
        }

        collection.push({
          type: 'Feature',
          geometry: feature.geometry,
          properties: addFilterProps(datasetId, properties, feature),
        });
      }
    }
  }

  return collection;
}

function transformEvenementen(
  datasetId: DatasetId,
  config: DatasetConfig,
  responseData: any
) {
  const results = getApiEmbeddedResponse(datasetId, responseData);
  const collection: DatasetFeatures = [];
  if (results && results.length) {
    for (const feature of results) {
      if (feature?.geometry?.coordinates) {
        collection.push({
          type: 'Feature',
          geometry: feature.geometry,
          properties: addFilterProps(
            datasetId,
            {
              id: feature.id,
              datasetId,
            },
            feature
          ),
        });
      }
    }
  }
  return collection;
}

function transformParkeerzoneCoords(
  datasetId: DatasetId,
  config: DatasetConfig,
  responseData: any
) {
  const results =
    responseData?.features || getApiEmbeddedResponse(datasetId, responseData);
  const collection: DatasetFeatures = [];

  console.log(results);

  if (results && results.length) {
    for (const feature of results) {
      collection.push({
        type: 'Feature',
        geometry: feature.geometry,
        properties: addFilterProps(
          datasetId,
          {
            id: feature?.properties?.id || feature.id,
            datasetId,
            color:
              feature?.properties?.gebiedskleurcode || feature.gebiedskleurcode,
          },
          feature
        ),
      });
    }
  }
  return collection;
}
