import { AxiosResponse, AxiosResponseHeaders } from 'axios';
import { differenceInDays, format } from 'date-fns';
import slug from 'slugme';
import Supercluster from 'supercluster';
import { Colors, FeatureToggle } from '../../../universal/config/app';
import { IS_PRODUCTION } from '../../../universal/config/env';
import {
  DATASETS,
  DatasetCategoryId,
  DatasetId,
  DatasetPropertyFilter,
  DatasetPropertyName,
  DatasetPropertyValue,
  FeatureType,
} from '../../../universal/config/myarea-datasets';
import { capitalizeFirstLetter, uniqueArray } from '../../../universal/helpers';
import { DataRequestConfig } from '../../config';
import { axiosRequest, getNextUrlFromLinkHeader } from '../../helpers';
import FileCache from '../../helpers/file-cache';
import {
  discoverSingleDsoApiEmbeddedResponse,
  dsoApiListUrl,
  getDsoApiEmbeddedResponse,
  transformGenericApiListResponse,
} from './dso-helpers';

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

interface TransformDetailProps {
  datasetId: DatasetId;
  config: DatasetConfig;
  id: string;
  datasetCache: FileCache | null;
}

export interface DatasetConfig {
  // Url of the api for getting the Map features e.g https://data.amsterdam.nl/api/v1/dataset-name <- returns all features
  listUrl: string | ((config: DatasetConfig) => string);
  // An optional url for loading more feature data via a detail endpoint e.g https://data.amsterdam.nl/api/v1/dataset-name/$feature-id <- returns only feature referenced by $feature-id
  detailUrl?: string | ((config: DatasetConfig) => string);
  // Response data transformer that is passed to axios transformData for the listUrl response
  transformList?: (
    datasetId: DatasetId,
    config: DatasetConfig,
    data: any
  ) => DatasetFeatures;
  // Response data transformer that is passed to axios transformData for the detailUrl response. If we haven't specified a detailUrl for a dataset.
  // The cached transformed response of the listUrl will be passed via the options.
  transformDetail?: (responseData: any, options: TransformDetailProps) => any;
  // DataRequestConfig used in source-api-request.
  requestConfig?: DataRequestConfig;
  // Wether the response should be cached to disk
  cache?: boolean;
  // The time in minutes before the cache on disk expires
  cacheTimeMinutes?: number;
  // The type of Feature an api returns. Used for filtering type of dataset configs.
  featureType: FeatureType;
  // Used for polyline layer index so we can place smaller shapes above larger ones.
  zIndex?: zIndexPane;
  // An array of property names we also want to add to the dataset. By default only id and geometry properties are retrieved form the DSO api's. Only used in combination with the dsoApiListUrl() function.
  dsoApiAdditionalStaticFieldNames?: DatasetPropertyName[];
  // NOTE: The ID key also has to be added to the `dsoApiAdditionalStaticFieldNames` array if using the DSO REST API endpoints. The WFS endpoints retrieve all the property names by default so `dsoApiAdditionalStaticFieldNames` can be left empty.
  // The property that functions as ID for the features if an `id` key is not present or if we want to utilize another value for `id`.
  // Some api's have differing property names for features. In one response features can have keys like idNummer which corresponds to id_nummer in a detail response.
  idKeyList?: string;
  idKeyDetail?: string;
  // Some api's have a different name for the geometry field for example `geometrie`.
  geometryKey?: string;
  //
  triesUntilConsiderdStale: number;
  // If disabled is true, the dataset will not be retrieved.
  disabled?: boolean;
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
    transformList: transformGenericApiListResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
    requestConfig: {
      headers: {
        'X-Api-Key': process.env.BFF_DATA_AMSTERDAM_API_KEY,
      },
    },
    disabled: !FeatureToggle.evenementenDatasetActive,
  },
  bekendmakingen: {
    listUrl: `https://api.data.amsterdam.nl/v1/wfs/bekendmakingen/?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=bekendmakingen&OUTPUTFORMAT=geojson&SRSNAME=urn:ogc:def:crs:EPSG::4326`,
    detailUrl: `https://${
      !IS_PRODUCTION ? 'acc.' : ''
    }api.data.amsterdam.nl/v1/bekendmakingen/bekendmakingen/`,
    transformList: transformGenericApiListResponse,
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
    disabled: !FeatureToggle.bekendmakingenDatasetActive,
  },
  parkeerzones: {
    listUrl: dsoApiListUrl('parkeerzones/parkeerzones'),
    detailUrl: 'https://api.data.amsterdam.nl/v1/parkeerzones/parkeerzones/',
    transformList: transformParkeerzoneCoords,
    featureType: 'MultiPolygon',
    zIndex: zIndexPane.PARKEERZONES,
    dsoApiAdditionalStaticFieldNames: ['gebiedskleurcode', 'gebiedscode'],
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
    dsoApiAdditionalStaticFieldNames: ['gebiedscode'],
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
    transformList: transformGenericApiListResponse,
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
    transformList: transformGenericApiListResponse,
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
    transformList: transformGenericApiListResponse,
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
    dsoApiAdditionalStaticFieldNames: ['type'],
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
    transformList: transformGenericApiListResponse,
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
    transformList: transformGenericApiListResponse,
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
    transformList: transformGenericApiListResponse,
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
    transformList: transformGenericApiListResponse,
    featureType: 'MultiPolygon',
    zIndex: zIndexPane.BEDRIJVENINVESTERINGSZONES,
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    dsoApiAdditionalStaticFieldNames: ['naam'],
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
      `https://api.meldingen.amsterdam.nl/signals/v1/public/signals/geography?bbox=4.705770%2C52.256977%2C5.106206%2C52.467268&geopage=1`,
    transformList: transformMeldingenBuurtResponse,
    transformDetail: transformMeldingDetailResponse,
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_8_HOURS_IN_MINUTES,
    geometryKey: 'geometry',
    triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
    idKeyList: 'id',
    requestConfig: {
      request: fetchMeldingenBuurt,
      cancelTimeout: 30000,
    },
  },
  laadpalen: {
    listUrl:
      'https://map.data.amsterdam.nl/maps/oplaadpunten?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=ms:normaal_beschikbaar&OUTPUTFORMAT=geojson&SRSNAME=urn:ogc:def:crs:EPSG::4326',
    // transformList: transformLaadpalenListReponse, // Transforming the data is done in fetchAndTransformLaadpalen
    transformDetail: transformLaadpalenDetailResponse,
    idKeyList: 'id',
    featureType: 'Point',
    cacheTimeMinutes: BUURT_CACHE_TTL_1_WEEK_IN_MINUTES,
    geometryKey: 'geometry',
    triesUntilConsiderdStale: DEFAULT_TRIES_UNTIL_CONSIDERED_STALE,
    dsoApiAdditionalStaticFieldNames: [
      'connector_type',
      'charging_cap_max',
      'url',
      'name',
      'street',
      'housenumber',
      'housenumberext',
      'postalcode',
      'city',
      'provider',
    ],
    requestConfig: {
      request: fetchAndTransformLaadpalen,
      cancelTimeout: 30000,
    },
    disabled: !FeatureToggle.laadpalenActive,
  },
};

// This function retrieves a maximum of 5 `pages` with data from the meldingen api.
export async function fetchMeldingenBuurt(requestConfig: DataRequestConfig) {
  const maxPages = 5;

  let nextRequestConfig = { ...requestConfig };
  let response: AxiosResponse = await axiosRequest.request(nextRequestConfig);
  let responseIteration = 0;
  let combinedResponseData: DatasetFeatures = response.data;

  while (true) {
    if (response.headers?.link?.includes('rel="next"')) {
      const nextUrl = getNextUrlFromLinkHeader(
        response.headers as AxiosResponseHeaders
      );
      const nextPage = nextUrl?.searchParams.get('page');

      // Stop fetching next when reaching maxPages.
      if (
        responseIteration === maxPages || // Safeguard if api response does not supply page parameter correctly
        !nextUrl ||
        (nextUrl && nextPage && parseInt(nextPage, 10) > maxPages)
      ) {
        break;
      }

      nextRequestConfig = {
        ...requestConfig,
        url: nextUrl.toString(),
      };

      response = await axiosRequest.request<DatasetFeatures>(nextRequestConfig);

      combinedResponseData = combinedResponseData.concat(response.data);

      responseIteration++;
    } else {
      // Couldn't find what we are looking for. Break the loop.
      break;
    }
  }

  response.data = combinedResponseData;

  return response;
}

export function transformMeldingenBuurtResponse(
  datasetId: DatasetId,
  config: DatasetConfig,
  responseData: { features: DatasetFeatures }
): DatasetFeatures {
  const collection = responseData?.features?.map((sourceFeature: MaFeature) => {
    let id = '';

    // Assign a custom id because the response features do not include id's
    if (config.idKeyList) {
      id = slug(
        `${
          sourceFeature.properties.category.slug
        }-${sourceFeature.properties.created_at.replaceAll(/[^0-9.]/g, '')}`
      );
    }

    const feature: MaFeature = {
      type: 'Feature',
      properties: {
        id,
        datasetId,
        dateCreated: sourceFeature.properties.created_at,
        category: sourceFeature.properties.category.parent.slug,
        subcategory: sourceFeature.properties.category.name,
      },
      geometry: sourceFeature.geometry,
    };

    const dataSetConfig =
      DATASETS.meldingenBuurt.datasets.meldingenBuurt?.filters?.category
        ?.valueConfig;

    const filterCategoryKey = capitalizeFirstLetter(
      feature.properties.category
    );

    // If the source api publishes a new category which is not covered in our valueConfig for this particular dataset, assign a misc. category.
    if (dataSetConfig && !(filterCategoryKey in dataSetConfig)) {
      feature.properties.category = 'overig';
    }

    return feature;
  });

  return collection ?? [];
}

function transformMeldingDetailResponse(
  responseData: null,
  { datasetId, config, id, datasetCache }: TransformDetailProps
) {
  const item = datasetCache
    ?.getKey('features')
    ?.find((feature: MaFeature) => feature.properties.id === id);

  if (!item) {
    throw new Error(`Buurt item in the cache with id ${id} not found.`);
  }

  return item.properties;
}

export async function fetchAndTransformLaadpalen<T>(
  requestConfig: DataRequestConfig
): Promise<AxiosResponse<T>> {
  const urls = [
    requestConfig.url, // zie datasetEndpoints.laadpalen.listUrl
    'https://map.data.amsterdam.nl/maps/oplaadpunten?SERVICE=WFS&VERSION=2.0.0&REQUEST=GetFeature&TYPENAMES=ms:snel_beschikbaar&OUTPUTFORMAT=geojson&SRSNAME=urn:ogc:def:crs:EPSG::4326',
  ];

  const datasetId = 'laadpalen';
  const datasetConfig = datasetEndpoints.laadpalen;

  const requests = urls.map((url) => {
    return axiosRequest.request<{ features: DatasetFeatures }>({
      ...requestConfig,
      url,
    });
  });

  const responses: AxiosResponse<
    { features: DatasetFeatures } | DatasetFeatures
  >[] = await Promise.all(requests);

  // Merge the features we got from the 2 responses.
  const features = responses
    .map((response, index) => {
      if ('features' in response.data) {
        return response.data.features.map((feature) => {
          // The second (index==1) dataset contains chargers of type `snellader`. Here we add a property that distinguishes it from the features of the first dataset _before_ the responses are merged.
          Object.assign(feature.properties, { snellader: index === 1 });
          return feature;
        });
      }
      return response.data;
    })
    .flat();

  // Transform all the features at once and assign back the result to the first Axios response.
  responses[0].data = transformGenericApiListResponse(
    datasetId,
    datasetConfig,
    {
      features: transformLaadpalenFeatures(features),
    }
  );

  return <AxiosResponse<T>>responses[0];
}

function transformLaadpalenFeatures(featuresSource: DatasetFeatures) {
  let features = featuresSource;

  const wattRanges = [
    { label: 'W1', range: [0, 50] },
    { label: 'W2', range: [50, 100] },
    { label: 'W3', range: [100, 300] },
    { label: 'W4', range: [300, Infinity] },
  ];

  const connectorTypes = uniqueArray(
    features.flatMap((feature) => feature.properties.connector_type.split(';'))
  );

  features = features.map((feature) => {
    // Determine the maximum wattage
    const watt = parseInt(feature.properties.charging_cap_max, 10);
    const wattRange = wattRanges.find((wattRange) => {
      return watt >= wattRange.range[0] && watt < wattRange.range[1];
    })?.label;
    // Assign a misc range
    feature.properties.maxWattage = wattRange ?? 'W5';

    // Add the connector type as feature property, so we can filter it
    for (const connectorType of connectorTypes) {
      feature.properties[connectorType] =
        feature.properties.connector_type.includes(connectorType);
    }

    return feature;
  });

  return features;
}

function transformLaadpalenDetailResponse(
  responseData: any,
  { datasetId, config, id, datasetCache }: TransformDetailProps
) {
  const item = datasetCache
    ?.getKey('features')
    ?.find((item: any) => item.properties.id === id);

  return item?.properties ?? null;
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
    : getDsoApiEmbeddedResponse(datasetId, responseData);
  return transformGenericApiListResponse(datasetId, config, {
    features: features
      .filter(
        (feature: any) =>
          feature.fractie_omschrijving?.toLowerCase() !== 'plastic' // Gemeente Amsterdam does not work with plastic containers anymore.
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

function transformAfvalcontainerDetailResponse(responseData: any) {
  const feature = discoverSingleDsoApiEmbeddedResponse(responseData);
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

function transformParkeerzoneCoords(
  datasetId: DatasetId,
  config: DatasetConfig,
  responseData: any
) {
  const features = transformGenericApiListResponse(
    datasetId,
    config,
    responseData
  );

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
  const features = transformGenericApiListResponse(
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
  const features = transformGenericApiListResponse(
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
  const features = transformGenericApiListResponse(
    datasetId,
    config,
    responseData
  );

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
  const features = getDsoApiEmbeddedResponse(datasetId, responseData);

  if (!features) {
    return [];
  }

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
  return transformGenericApiListResponse(datasetId, config, { features });
}
