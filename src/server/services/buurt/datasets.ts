import { differenceInDays, format } from 'date-fns';
import Supercluster from 'supercluster';
import { Colors } from '../../../universal/config/app';
import { OTAP_ENV, IS_PRODUCTION } from '../../../universal/config/env';
import {
  DatasetCategoryId,
  DatasetId,
  DatasetPropertyFilter,
  DatasetPropertyName,
  DatasetPropertyValue,
  DATASETS,
  FeatureType,
} from '../../../universal/config/myarea-datasets';
import { capitalizeFirstLetter } from '../../../universal/helpers';
import { DataRequestConfig } from '../../config';
import {
  discoverSingleApiEmbeddedResponse,
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
  >,
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
export const DEFAULT_TRIES_UNTIL_CONSIDERED_STALE = 5;

export interface DatasetConfig {
  datasetIds?: DatasetId[];
  listUrl?: string | ((config: DatasetConfig) => string);
  detailUrl?: string | ((config: DatasetConfig) => string);
  transformList?: (
    datasetId: DatasetId,
    config: DatasetConfig,
    data: any
  ) => DatasetFeatures;
  transformDetail?: (
    datasetId: DatasetId,
    config: DatasetConfig,
    id: string,
    data: any
  ) => any;
  requestConfig?: DataRequestConfig;
  cache?: boolean;
  cacheTimeMinutes?: number;
  featureType: FeatureType;
  zIndex?: zIndexPane;
  additionalStaticFieldNames?: DatasetPropertyName[];
  // NOTE: The ID key also has to be added to the `additionalStaticFieldNames` array if using the DSO REST API endpoints. The WFS endpoints retrieve all the property names by default so `additionalStaticFieldNames` can be left empty.
  idKeyList?: string;
  idKeyDetail?: string;
  geometryKey?: string;
  triesUntilConsiderdStale: number;
  disabled?: boolean;
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
    const fieldNames = propertyFilters ? Object.keys(propertyFilters) : [];

    if (datasetConfig.additionalStaticFieldNames) {
      fieldNames.push(...datasetConfig.additionalStaticFieldNames);
    }

    const additionalFieldNames = fieldNames.length
      ? ',' + fieldNames.join(',')
      : '';

    const dsoApiUrl = `${apiUrl}${additionalFieldNames}${pageSizeParam}&_format=json`;

    return dsoApiUrl;
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
    transformList: transformAfvalcontainersResponse,
    transformDetail: transformAfvalcontainerDetailResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    idKeyList: 'id_nummer',
    idKeyDetail: 'idNummer',
    triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
    requestConfig: {
      headers: {
        'X-Api-Key': process.env.BFF_DATA_AMSTERDAM_API_KEY,
      },
    },
  },
  evenementen: {
    listUrl: dsoApiListUrl('evenementen/evenementen'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/evenementen/evenementen/',
    transformList: transformDsoApiListResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
    requestConfig: {
      headers: {
        'X-Api-Key': process.env.BFF_DATA_AMSTERDAM_API_KEY,
      },
    },
    // NOTE: Tried URL as unique ID but various events point to the same URL.
    // additionalStaticFieldNames: ['url'],
    // idKeyList: 'url',
    // idKeyDetail: 'url',
  },
  bekendmakingen: {
    listUrl: `https://api.data.amsterdam.nl/v1/wfs/bekendmakingen/?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=bekendmakingen&OUTPUTFORMAT=geojson&SRSNAME=urn:ogc:def:crs:EPSG::4326`,
    detailUrl: `https://${
      !IS_PRODUCTION ? 'acc.' : ''
    }api.data.amsterdam.nl/v1/bekendmakingen/bekendmakingen/`,
    transformList: transformDsoApiListResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    idKeyList: 'officielebekendmakingen_id',
    idKeyDetail: 'officielebekendmakingenId',
    triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
    requestConfig: {
      headers: {
        'X-Api-Key': process.env.BFF_DATA_AMSTERDAM_API_KEY,
      },
    },
    // NOTE: Zie https://gemeente-amsterdam.atlassian.net/browse/MIJN-7467
    disabled: true,
  },
  parkeerzones: {
    listUrl: dsoApiListUrl('parkeerzones/parkeerzones'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/parkeerzones/parkeerzones/',
    transformList: transformParkeerzoneCoords,
    featureType: 'MultiPolygon',
    zIndex: zIndexPane.PARKEERZONES,
    additionalStaticFieldNames: ['gebiedskleurcode', 'gebiedscode'],
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    idKeyList: 'gebiedscode',
    idKeyDetail: 'gebiedscode',
    triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
    requestConfig: {
      headers: {
        'X-Api-Key': process.env.BFF_DATA_AMSTERDAM_API_KEY,
      },
    },
  },
  parkeerzones_uitzondering: {
    listUrl: dsoApiListUrl('parkeerzones/parkeerzones_uitzondering'),
    detailUrl:
      'https://api.data.amsterdam.nl/v1/parkeerzones/parkeerzones_uitzondering/',
    transformList: transformParkeerzoneCoords,
    featureType: 'MultiPolygon',
    zIndex: zIndexPane.PARKEERZONES_UITZONDERING,
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    additionalStaticFieldNames: ['gebiedscode'],
    idKeyList: 'gebiedscode',
    idKeyDetail: 'gebiedscode',
    triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
    requestConfig: {
      headers: {
        'X-Api-Key': process.env.BFF_DATA_AMSTERDAM_API_KEY,
      },
    },
  },
  zwembad: {
    listUrl: dsoApiListUrl('sport/zwembad'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/zwembad/',
    transformList: transformDsoApiListResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
    requestConfig: {
      headers: {
        'X-Api-Key': process.env.BFF_DATA_AMSTERDAM_API_KEY,
      },
    },
  },
  sportpark: {
    listUrl: dsoApiListUrl('sport/sportpark'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/sportpark/',
    transformList: transformDsoApiListResponse,
    featureType: 'MultiPolygon',
    zIndex: zIndexPane.SPORTPARK,
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
    requestConfig: {
      headers: {
        'X-Api-Key': process.env.BFF_DATA_AMSTERDAM_API_KEY,
      },
    },
  },
  sportveld: {
    listUrl: dsoApiListUrl('sport/sportveld'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/sportveld/',
    transformList: transformDsoApiListResponse,
    featureType: 'MultiPolygon',
    zIndex: zIndexPane.SPORTVELD,
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
    requestConfig: {
      headers: {
        'X-Api-Key': process.env.BFF_DATA_AMSTERDAM_API_KEY,
      },
    },
  },
  gymzaal: {
    listUrl: dsoApiListUrl('sport/gymsportzaal', undefined, 'gymzaal'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/gymsportzaal/',
    transformList: transformGymzaalResponse,
    featureType: 'Point',
    additionalStaticFieldNames: ['type'],
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
    requestConfig: {
      headers: {
        'X-Api-Key': process.env.BFF_DATA_AMSTERDAM_API_KEY,
      },
    },
  },
  sportzaal: {
    listUrl: dsoApiListUrl('sport/gymsportzaal', undefined, 'sportzaal'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/gymsportzaal/',
    transformList: transformSportzaalResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
    requestConfig: {
      headers: {
        'X-Api-Key': process.env.BFF_DATA_AMSTERDAM_API_KEY,
      },
    },
  },
  sporthal: {
    listUrl: dsoApiListUrl('sport/sporthal'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/sporthal/',
    transformList: transformDsoApiListResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
    requestConfig: {
      headers: {
        'X-Api-Key': process.env.BFF_DATA_AMSTERDAM_API_KEY,
      },
    },
  },
  sportaanbieder: {
    listUrl: dsoApiListUrl('sport/sportaanbieder', 2000),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/sportaanbieder/',
    transformList: transformDsoApiListResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
    requestConfig: {
      headers: {
        'X-Api-Key': process.env.BFF_DATA_AMSTERDAM_API_KEY,
      },
    },
  },
  openbaresportplek: {
    listUrl: dsoApiListUrl('sport/openbaresportplek'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/openbaresportplek/',
    transformList: transformDsoApiListResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
    requestConfig: {
      headers: {
        'X-Api-Key': process.env.BFF_DATA_AMSTERDAM_API_KEY,
      },
    },
  },
  hardlooproute: {
    listUrl: dsoApiListUrl('sport/hardlooproute'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/sport/hardlooproute/',
    transformList: transformHardlooproutesResponse,
    featureType: 'MultiLineString',
    zIndex: zIndexPane.HARDLOOPROUTE,
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
    requestConfig: {
      headers: {
        'X-Api-Key': process.env.BFF_DATA_AMSTERDAM_API_KEY,
      },
    },
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
    additionalStaticFieldNames: ['naam'],
    idKeyList: 'naam',
    idKeyDetail: 'naam',
    triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
    requestConfig: {
      headers: {
        'X-Api-Key': process.env.BFF_DATA_AMSTERDAM_API_KEY,
      },
    },
  },
  wior: {
    listUrl: () => {
      const url = `https://api.data.amsterdam.nl/v1/wior/wior/?_fields=id,geometrie,datumStartUitvoering,datumEindeUitvoering&_pageSize=2000&datumEindeUitvoering[gte]=${format(
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
    triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
    requestConfig: {
      headers: {
        'X-Api-Key': process.env.BFF_DATA_AMSTERDAM_API_KEY,
      },
    },
  },
  meldingenBuurt: {
    listUrl: () =>
      `https://${
        OTAP_ENV === 'production' ? '' : 'acc.'
      }api.meldingen.amsterdam.nl/signals/v1/public/signals/geography?bbox=4.705770,52.256977,5.106206,52.467268&geopage=1`,
    transformList: transformMeldingenBuurtResponse,
    transformDetail: transformMeldingDetailResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    geometryKey: 'geometry',
    triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
    idKeyList: 'ma_melding_id',
    requestConfig: {
      combinePaginatedResults: (responseData, newResponse) => {
        return newResponse.content === null
          ? responseData
          : responseData.concat(newResponse.content);
      },
      maximumAmountOfPages: 5,
    },
  },
};

function transformMeldingenBuurtResponse(
  datasetId: DatasetId,
  config: DatasetConfig,
  responseData: any
) {
  const features =
    responseData?.features.map((feature: any, index: number) => {
      const categorie = feature.properties.category.parent.slug;

      const dataSetConfig =
        DATASETS.meldingenBuurt.datasets.meldingenBuurt?.filters?.categorie
          ?.valueConfig;

      const displayCat = capitalizeFirstLetter(categorie);

      if (config.idKeyList) feature.properties[config.idKeyList] = index;

      feature.properties.categorie = categorie;
      if (dataSetConfig && !(displayCat in dataSetConfig)) {
        feature.properties.categorie = 'overig';
      }

      return feature;
    }) || [];

  return transformDsoApiListResponse(datasetId, config, { features });
}

function createCustomFractieOmschrijving(featureProps: any) {
  if (featureProps.serienummer?.trim().startsWith('Kerstboom')) {
    return 'Kerstboom inzamellocatie';
  }
  if (featureProps.type_id === '5467' || featureProps.type_id === '4371') {
    return 'GFT';
  }
  if (featureProps.type_id === '4886') {
    return 'Brood';
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
    features: features
      .filter(
        (feature: any) =>
          feature.fractie_omschrijving?.toLowerCase() !== 'plastic'
      )
      .map((feature: any) => {
        let fractie_omschrijving = feature.properties.fractie_omschrijving;
        if (!fractie_omschrijving || fractie_omschrijving === 'GFT') {
          fractie_omschrijving = createCustomFractieOmschrijving(
            feature.properties
          );
        }
        return {
          ...feature,
          properties: {
            ...feature.properties,
            fractie_omschrijving,
          },
        };
      }),
  });
}

function transformAfvalcontainerDetailResponse(
  datasetId: DatasetId,
  config: DatasetConfig,
  id: string,
  responseData: any
) {
  const feature = discoverSingleApiEmbeddedResponse(responseData);
  let fractieOmschrijving = feature.fractieOmschrijving;
  if (!fractieOmschrijving || fractieOmschrijving === 'GFT') {
    fractieOmschrijving = createCustomFractieOmschrijving({
      ...feature,
      type_id: feature.typeId,
    });
  }
  return {
    ...responseData,
    _embedded: {
      container: [
        {
          ...feature,
          fractieOmschrijving,
        },
      ],
    },
  };
}

function transformMeldingDetailResponse(
  datasetId: DatasetId,
  config: DatasetConfig,
  id: string,
  responseData: {
    features: any[];
  }
) {
  const item = responseData?.features[parseInt(id, 10)];

  if (!item) {
    throw new Error(
      `Buurt item with id ${id} not found. Got ${responseData?.features?.length} items to search.`
    );
  }

  return {
    id,
    categorie: item?.properties?.category?.parent?.name,
    subcategorie: item?.properties?.category?.name,
    datumCreatie: item?.properties?.created_at,
  };
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
        oost: Colors.supportLightblue,
        west: Colors.supportPurple,
        noord: Colors.supportFocus,
        zuid: Colors.supportOrange,
        zuidoost: Colors.supportLightgreen,
        'nieuw-west': Colors.supportYellow,
        haven: Colors.supportPink,
        centrum: Colors.supportValid,
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
    { label: 'Binnenkort', range: [0.156, 0.5] },
    { label: '0-1 jaar', range: [0, 1] },
    { label: '1-3 jaar', range: [1, 3] },
    { label: '>3 jaar', range: [3, Infinity] },
    { label: 'Onbekend', range: [] },
  ];

  for (const feature of features) {
    const start = feature.datumStartUitvoering;
    const eind = feature.datumEindeUitvoering;
    if (start) {
      if (new Date(eind) > new Date(start)) {
        feature.duur = 'meerdaags';
      } else {
        feature.duur = 'enkel';
      }
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
