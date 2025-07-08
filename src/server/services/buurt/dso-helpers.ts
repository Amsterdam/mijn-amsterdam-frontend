import type {
  DatasetConfig,
  DatasetFeatureProperties,
  DatasetFeatures,
  MaFeature,
} from './datasets.ts';
import {
  createFeaturePropertiesFromPropertyFilterConfig,
  getFeaturePolylineColor,
  getPropertyFilters,
  LatLngPositions,
  recursiveCoordinateSwap,
} from './helpers.ts';
import {
  DatasetId,
  FeatureType,
  POLYLINE_GEOMETRY_TYPES,
} from '../../../universal/config/myarea-datasets.ts';

const DEFAULT_PAGE_SIZE = 1000;

export function dsoApiListUrl(
  dataset: string,
  pageSize: number = DEFAULT_PAGE_SIZE,
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

    if (datasetConfig.dsoApiAdditionalStaticFieldNames) {
      fieldNames.push(...datasetConfig.dsoApiAdditionalStaticFieldNames);
    }

    const additionalFieldNames = fieldNames.length
      ? ',' + fieldNames.join(',')
      : '';

    const dsoApiUrl = `${apiUrl}${additionalFieldNames}${pageSizeParam}&_format=json`;

    return dsoApiUrl;
  };
}

export function getDsoApiEmbeddedResponse(
  id: string,
  responseData: DsoApiResponse
) {
  const results = responseData?._embedded?.[id];
  return Array.isArray(results) ? results : null;
}

export type DsoApiResponse<T = WFSFeatureSource> = {
  _embedded: Record<string, T[]>;
};

type GeoKey = 'geometry' | 'geometrie';

export type WFSFeatureSource<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  [key in GeoKey]?: GeoJSON.Geometry;
} & { properties: T } & Record<string, unknown>;

export type WFSApiResponse<T = WFSFeatureSource> = {
  features: T[];
};

export function discoverSingleDsoApiEmbeddedResponse<T = WFSFeatureSource>(
  responseData: DsoApiResponse<T>
) {
  // Use first key found in embedded response
  const embeddedKey = responseData?._embedded
    ? Object.keys(responseData._embedded)[0]
    : undefined;
  // Blindly assume there is an array with 1 result
  return embeddedKey ? responseData._embedded[embeddedKey][0] : null;
}

// Can handle DSO api and WFS api responses
export function transformGenericApiListResponse(
  datasetId: DatasetId,
  config: DatasetConfig,
  responseData: WFSApiResponse | DsoApiResponse,
  embeddedDatasetId?: string
) {
  const results =
    'features' in responseData
      ? responseData?.features
      : getDsoApiEmbeddedResponse(embeddedDatasetId || datasetId, responseData);

  const collection: DatasetFeatures = [];
  const geometryKey = (config.geometryKey || 'geometry') as GeoKey;

  if (results && results.length) {
    for (const feature of results) {
      const featureGeometry = feature[geometryKey] as GeoJSON.Geometry;
      if (
        geometryKey in feature &&
        featureGeometry &&
        'coordinates' in featureGeometry &&
        featureGeometry.coordinates
      ) {
        const featureProperties = feature.properties as
          | Record<string, unknown>
          | undefined;
        const id = config.idKeyList
          ? encodeURIComponent(
              String(
                featureProperties
                  ? featureProperties[config.idKeyList]
                  : feature[config.idKeyList]
              )
            )
          : String(featureProperties?.id || feature.id);

        const properties: DatasetFeatureProperties = {
          id,
          datasetId,
        };

        const hasShapeGeometry = POLYLINE_GEOMETRY_TYPES.includes(
          featureGeometry.type as FeatureType // NOTE: FeatureType does not include all possible values of GeoJSON.Geometry['type']
        );

        if (hasShapeGeometry) {
          properties.color = getFeaturePolylineColor(datasetId, feature);
          if (config?.zIndex) {
            properties.zIndex = config.zIndex;
          }
          // Swap the coordinates of the polyline datasets so leaflet can render them easily on the front-end.
          featureGeometry.coordinates = recursiveCoordinateSwap(
            featureGeometry.coordinates as LatLngPositions
          ) as MaFeature['geometry']['coordinates'];
        }

        collection.push({
          type: 'Feature',
          geometry: featureGeometry,
          properties: createFeaturePropertiesFromPropertyFilterConfig(
            datasetId,
            properties,
            feature
          ),
        });
      }
    }
  }

  return collection;
}
