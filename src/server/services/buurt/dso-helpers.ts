import {
  DatasetId,
  POLYLINE_GEOMETRY_TYPES,
} from '../../../universal/config/myarea-datasets';
import type {
  DatasetConfig,
  DatasetFeatureProperties,
  DatasetFeatures,
} from './datasets';
import {
  createFeaturePropertiesFromPropertyFilterConfig,
  getFeaturePolylineColor,
  getPropertyFilters,
  recursiveCoordinateSwap,
} from './helpers';

export function dsoApiListUrl(
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

export function getDsoApiEmbeddedResponse(id: string, responseData: any) {
  const results = responseData?._embedded?.[id];
  return Array.isArray(results) ? results : null;
}

export function discoverSingleDsoApiEmbeddedResponse(responseData: any) {
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
  responseData: any,
  embeddedDatasetId?: string
) {
  const results = responseData?.features
    ? responseData?.features
    : getDsoApiEmbeddedResponse(embeddedDatasetId || datasetId, responseData);

  const collection: DatasetFeatures = [];
  const geometryKey = config.geometryKey || 'geometry';

  if (results && results.length) {
    for (const feature of results) {
      if (feature[geometryKey]?.coordinates) {
        const id = config.idKeyList
          ? encodeURIComponent(
              String(
                feature?.properties
                  ? feature?.properties[config.idKeyList]
                  : feature[config.idKeyList]
              )
            )
          : String(feature?.properties?.id || feature.id);

        const properties: DatasetFeatureProperties = {
          id,
          datasetId,
        };

        const hasShapeGeometry = POLYLINE_GEOMETRY_TYPES.includes(
          feature[geometryKey].type
        );

        if (hasShapeGeometry) {
          properties.color = getFeaturePolylineColor(datasetId, feature);
          if (config?.zIndex) {
            properties.zIndex = config.zIndex;
          }
          // Swap the coordinates of the polyline datasets so leaflet can render them easily on the front-end.
          feature[geometryKey].coordinates = recursiveCoordinateSwap(
            feature[geometryKey].coordinates
          );
        }
        collection.push({
          type: 'Feature',
          geometry: feature[geometryKey],
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
