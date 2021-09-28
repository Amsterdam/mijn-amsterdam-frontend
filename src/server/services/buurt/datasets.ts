import { differenceInDays, format } from 'date-fns';
import Supercluster from 'supercluster';
import {
  DatasetCategoryId,
  DatasetId,
  DatasetPropertyFilter,
  DatasetPropertyName,
  DatasetPropertyValue,
  FeatureType,
} from '../../../universal/config/buurt';
import { DataRequestConfig } from '../../config';
import {
  getApiEmbeddedResponse,
  getPropertyFilters,
  transformDsoApiListResponse,
} from './helpers';

enum zIndexPane {
  PARKEERZONES = '650',
  BEDRIJVENINVESTERINGSZONES = '651',
  PARKEERZONES_UITZONDERING = '660',
  HARDLOOPROUTE = '670',
  WIOR = '671',
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
export const BUURT_CACHE_TTL_8_HOURS_IN_MINUTES = 8 * 60;
export const BUURT_CACHE_TTL_1_WEEK_IN_MINUTES =
  7 * BUURT_CACHE_TTL_1_DAY_IN_MINUTES;
export const ACCEPT_CRS_4326 = {
  'Accept-Crs': 'EPSG:4326', // Will return coordinates in [lng/lat] format
};
export const DEFAULT_API_REQUEST_TIMEOUT = 1000 * 60 * 3; // 3 mins

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
  featureType: FeatureType;
  zIndex?: zIndexPane;
  additionalStaticPropertyNames?: DatasetPropertyName[];
  // NOTE: The ID key also has to be added to the `additionalStaticPropertyNames` array if using the DSO REST API endpoints. The WFS endpoints retrieve all the property names by default so `additionalStaticPropertyNames` can be left empty.
  idKeyList?: string;
  idKeyDetail?: string;
  geometryKey?: string;
}

function dsoApiListUrl(
  dataset: string,
  pageSize: number = 1000,
  datasetId?: DatasetId
) {
  return (datasetConfig: DatasetConfig) => {
    const [datasetCategoryId, embeddedDatasetId] = dataset.split('/');
    const apiUrl = `https://api.data.amsterdam.nl/v1/${datasetCategoryId}/${embeddedDatasetId}/?_fields=id,${
      datasetConfig.geometryKey || 'geometry'
    }`;
    const pageSizeParam = `&_pageSize=${pageSize}`;

    const propertyFilters = getPropertyFilters(datasetId || embeddedDatasetId);
    const propertyNames = propertyFilters ? Object.keys(propertyFilters) : [];

    if (datasetConfig.additionalStaticPropertyNames) {
      propertyNames.push(...datasetConfig.additionalStaticPropertyNames);
    }

    const dsoApiUrl =
      apiUrl +
      (propertyNames.length ? ',' + propertyNames.join(',') : '') +
      pageSizeParam;

    return dsoApiUrl;
  };
}

//:TODO Refactor this properly
export const themeColors = {
  primary: {
    main: '#004699',
    dark: '#00387a',
  },
  secondary: {
    main: '#ec0000',
    dark: '#bc0000',
  },
  tint: {
    level1: '#ffffff',
    level2: '#F5F5F5',
    level3: '#E6E6E6',
    level4: '#B4B4B4',
    level5: '#767676',
    level6: '#323232',
    level7: '#000000',
  },
  support: {
    valid: '#00A03C',
    invalid: '#EC0000',
    focus: '#FEC813',
  },
  supplement: {
    purple: '#A00078',
    pink: '#E50082',
    orange: '#FF9100',
    yellow: '#FFE600',
    lightgreen: '#BED200',
    darkgreen: '#00A03C',
    lightblue: '#009DEC',
  },
  bright: {
    main: '#ffffff',
  },
  error: {
    main: '#ec0000',
  },
};

export const datasetEndpoints: Record<
  DatasetId | DatasetCategoryId,
  DatasetConfig
> = {
  afvalcontainers: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/wfs/huishoudelijkafval/?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=container&OUTPUTFORMAT=geojson&SRSNAME=urn:ogc:def:crs:EPSG::4326&FILTER=%3CFilter%3E%3CAnd%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Estatus%3C/PropertyName%3E%3CLiteral%3E1%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3COr%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E110%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E16%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E111%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E112%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E67%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E181%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3CPropertyIsEqualTo%3E%3CPropertyName%3Eeigenaar_id%3C/PropertyName%3E%3CLiteral%3E113%3C/Literal%3E%3C/PropertyIsEqualTo%3E%3C/Or%3E%3C/And%3E%3C/Filter%3E',
    detailUrl: 'https://api.data.amsterdam.nl/v1/huishoudelijkafval/container/',
    transformList: transformAfvalcontainersResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    idKeyList: 'id_nummer',
    idKeyDetail: 'idNummer',
  },
  evenementen: {
    listUrl: dsoApiListUrl('evenementen/evenementen'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/evenementen/evenementen/',
    transformList: transformDsoApiListResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    // NOTE: Tried URL as unique ID but various events point to the same URL.
    // additionalStaticPropertyNames: ['url'],
    // idKeyList: 'url',
    // idKeyDetail: 'url',
  },
  bekendmakingen: {
    listUrl:
      'https://api.data.amsterdam.nl/v1/wfs/bekendmakingen/?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=bekendmakingen&OUTPUTFORMAT=geojson&SRSNAME=urn:ogc:def:crs:EPSG::4326',
    detailUrl:
      'https://api.data.amsterdam.nl/v1/bekendmakingen/bekendmakingen/',
    transformList: transformDsoApiListResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    idKeyList: 'officielebekendmakingen_id',
    idKeyDetail: 'officielebekendmakingenId',
  },
  parkeerzones: {
    listUrl: dsoApiListUrl('parkeerzones/parkeerzones'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/parkeerzones/parkeerzones/',
    transformList: transformParkeerzoneCoords,
    featureType: 'MultiPolygon',
    zIndex: zIndexPane.PARKEERZONES,
    additionalStaticPropertyNames: ['gebiedskleurcode', 'gebiedscode'],
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    idKeyList: 'gebiedscode',
    idKeyDetail: 'gebiedscode',
  },
  parkeerzones_uitzondering: {
    listUrl: dsoApiListUrl('parkeerzones/parkeerzones_uitzondering'),
    detailUrl:
      'https://api.data.amsterdam.nl/v1/parkeerzones/parkeerzones_uitzondering/',
    transformList: transformParkeerzoneCoords,
    featureType: 'MultiPolygon',
    zIndex: zIndexPane.PARKEERZONES_UITZONDERING,
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    additionalStaticPropertyNames: ['gebiedscode'],
    idKeyList: 'gebiedscode',
    idKeyDetail: 'gebiedscode',
  },
  zwembad: {
    listUrl: dsoApiListUrl('sport/zwembad'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/zwembad/',
    transformList: transformDsoApiListResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
  },
  sportpark: {
    listUrl: dsoApiListUrl('sport/sportpark'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/sportpark/',
    transformList: transformDsoApiListResponse,
    featureType: 'MultiPolygon',
    zIndex: zIndexPane.SPORTPARK,
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
  },
  sportveld: {
    listUrl: dsoApiListUrl('sport/sportveld'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/sportveld/',
    transformList: transformDsoApiListResponse,
    featureType: 'MultiPolygon',
    zIndex: zIndexPane.SPORTVELD,
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
  },
  gymzaal: {
    listUrl: dsoApiListUrl('sport/gymsportzaal', undefined, 'gymzaal'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/gymsportzaal/',
    transformList: transformGymzaalResponse,
    featureType: 'Point',
    additionalStaticPropertyNames: ['type'],
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
  },
  sportzaal: {
    listUrl: dsoApiListUrl('sport/gymsportzaal', undefined, 'sportzaal'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/gymsportzaal/',
    transformList: transformSportzaalResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
  },
  sporthal: {
    listUrl: dsoApiListUrl('sport/sporthal'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/sporthal/',
    transformList: transformDsoApiListResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
  },
  sportaanbieder: {
    listUrl: dsoApiListUrl('sport/sportaanbieder', 2000),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/sportaanbieder/',
    transformList: transformDsoApiListResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
  },
  openbaresportplek: {
    listUrl: dsoApiListUrl('sport/openbaresportplek'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/openbaresportplek/',
    transformList: transformDsoApiListResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
  },
  hardlooproute: {
    listUrl: dsoApiListUrl('sport/hardlooproute'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/hardlooproute/',
    transformList: transformHardlooproutesResponse,
    featureType: 'MultiLineString',
    zIndex: zIndexPane.HARDLOOPROUTE,
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
  },
  bedrijveninvesteringszones: {
    listUrl: dsoApiListUrl(
      'bedrijveninvesteringszones/bedrijveninvesteringszones'
    ),
    detailUrl:
      'https://api.data.amsterdam.nl/v1/bedrijveninvesteringszones/bedrijveninvesteringszones/',
    transformList: transformDsoApiListResponse,
    featureType: 'MultiPolygon',
    zIndex: zIndexPane.BEDRIJVENINVESTERINGSZONES,
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    additionalStaticPropertyNames: ['naam'],
    idKeyList: 'naam',
    idKeyDetail: 'naam',
  },
  wior: {
    listUrl: () => {
      const url = `https://api.data.amsterdam.nl/v1/wior/wior/?_fields=id,geometrie,datumStartUitvoering&_pageSize=2000&datumEindeUitvoering[gte]=${format(
        new Date(),
        'yyyy-MM-dd'
      )}`;
      return url;
    },
    detailUrl: 'https://api.data.amsterdam.nl/v1/wior/wior/',
    transformList: transformWiorApiListResponse,
    featureType: 'MultiPolygon',
    zIndex: zIndexPane.WIOR,
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    geometryKey: 'geometrie',
  },
};

function createCustomFractieOmschrijving(featureProps: any) {
  if (featureProps.serienummer?.trim().startsWith('Kerstboom')) {
    return 'Kerstboom inzamellocatie';
  }
  return 'Overig';
}

function transformAfvalcontainersResponse(
  datasetId: DatasetId,
  config: DatasetConfig,
  responseData: any
) {
  const features = responseData?.features
    ? responseData?.features
    : getApiEmbeddedResponse(datasetId, responseData);
  return transformDsoApiListResponse(datasetId, config, {
    features: features.map((feature: any) => {
      const fractie_omschrijving =
        feature.properties.fractie_omschrijving ||
        createCustomFractieOmschrijving(feature.properties);

      return {
        ...feature,
        fractie_omschrijving,
      };
    }),
  });
}

function transformParkeerzoneCoords(
  datasetId: DatasetId,
  config: DatasetConfig,
  responseData: any
) {
  const features = transformDsoApiListResponse(datasetId, config, responseData);

  if (features && features.length) {
    for (const feature of features) {
      // Change gebiedsnaam for grouping purposes
      feature.properties.gebiedsnaam =
        feature.properties.gebiedsnaam?.split(' ')[0] || 'Amsterdam';

      const colors: Record<string, string> = {
        oost: themeColors.supplement.lightblue,
        west: themeColors.supplement.purple,
        noord: themeColors.support.focus,
        zuid: themeColors.supplement.orange,
        zuidoost: themeColors.supplement.lightgreen,
        'nieuw-west': themeColors.supplement.yellow,
        haven: themeColors.supplement.pink,
        centrum: themeColors.support.valid,
      };

      // Add custom color code
      feature.properties.color =
        colors[feature.properties.gebiedsnaam.toLowerCase()] || 'red';

      // collection.push(featureTransformed);
    }
  }
  return features;
}

function transformSportzaalResponse(
  datasetId: DatasetId,
  config: DatasetConfig,
  responseData: any
) {
  const features = transformDsoApiListResponse(
    datasetId,
    config,
    responseData,
    'gymsportzaal'
  );

  return features.filter(
    (feature) =>
      feature.properties.type &&
      !feature.properties.type.toLowerCase().includes('gymz')
  );
}

function transformGymzaalResponse(
  datasetId: DatasetId,
  config: DatasetConfig,
  responseData: any
) {
  const features = transformDsoApiListResponse(
    datasetId,
    config,
    responseData,
    'gymsportzaal'
  );

  return features.filter(
    (feature) =>
      feature.properties.type &&
      feature.properties.type.toLowerCase().includes('gymz')
  );
}

export function transformHardlooproutesResponse(
  datasetId: DatasetId,
  config: DatasetConfig,
  responseData: any
) {
  const features = transformDsoApiListResponse(datasetId, config, responseData);

  const groups = [
    { label: '0-5 km', range: [0, 6] },
    { label: '6-10 km', range: [6, 11] },
    { label: 'Meer dan 10 km', range: [11, Infinity] },
  ];

  for (const feature of features) {
    const distance = feature.properties.lengte;
    if (distance) {
      const groupDistance = groups.find((group) => {
        return distance >= group.range[0] && distance < group.range[1];
      });
      feature.properties.lengte = groupDistance?.label || 'Overige lengtes';
    }
  }
  return features;
}

export function transformWiorApiListResponse(
  datasetId: DatasetId,
  config: DatasetConfig,
  responseData: any
) {
  const features = getApiEmbeddedResponse(datasetId, responseData);

  if (!features) {
    return [];
  }

  // Starts within
  const dateRanges = [
    { label: 'Lopend', range: [-Infinity, 0] },
    { label: '0-1 jaar', range: [0, 1] },
    { label: '1-3 jaar', range: [1, 3] },
    { label: '>3 jaar', range: [3, Infinity] },
    { label: 'Onbekend', range: [] },
  ];

  for (const feature of features) {
    const start = feature.datumStartUitvoering;
    if (start) {
      const startsWithinYears =
        differenceInDays(new Date(start), Date.now()) / 365;

      if (startsWithinYears < 0) {
        feature.datumStartUitvoering = dateRanges[0].label;
      } else {
        const dateRange = dateRanges.find((dateRange) => {
          return (
            startsWithinYears >= dateRange.range[0] &&
            startsWithinYears < dateRange.range[1]
          );
        });
        feature.datumStartUitvoering = dateRange?.label || 'Onbekend';
      }
    } else {
      feature.datumStartUitvoering = 'Onbekend';
    }
  }

  return transformDsoApiListResponse(datasetId, config, { features });
}
