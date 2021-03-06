import { LatLngTuple } from 'leaflet';
import {
  DatasetFilterSelection,
  DatasetId,
  DatasetPropertyFilter,
  DatasetPropertyValueWithCount,
  DATASETS,
  getDatasetCategoryId,
  POLYLINE_GEOMETRY_TYPES,
} from '../../../universal/config/buurt';
import {
  ApiErrorResponse,
  ApiResponse,
  ApiSuccessResponse,
} from '../../../universal/helpers';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { jsonCopy } from '../../../universal/helpers/utils';
import {
  DatasetConfig,
  datasetEndpoints,
  DatasetFeatureProperties,
  DatasetFeatures,
  DatasetResponse,
  MaFeature,
  MaPointFeature,
} from './datasets';

export function getApiEmbeddedResponse(id: string, responseData: any) {
  const results = responseData?._embedded && responseData?._embedded[id];
  return Array.isArray(results) ? results : null;
}

export function discoverSingleApiEmbeddedResponse(responseData: any) {
  // Use first key found in embedded response
  const embeddedKey = responseData?._embedded
    ? Object.keys(responseData._embedded)[0]
    : undefined;
  // Blindly assume there is an array with 1 result
  return embeddedKey ? responseData._embedded[embeddedKey][0] : null;
}

export function getDatasetEndpointConfig(
  endpointIDs?: string[],
  featureTypes?: DatasetConfig['featureType'][]
) {
  const configs: Array<[string, DatasetConfig]> = Object.entries(
    datasetEndpoints
  )
    .filter(([id, config]) => {
      const hasDatasetId =
        DATASETS[id] &&
        Object.keys(DATASETS[id].datasets).some((datasetId) =>
          endpointIDs?.includes(datasetId)
        );
      const isEndpoint = endpointIDs?.includes(id);

      return !endpointIDs || isEndpoint || hasDatasetId;
    })
    .filter(
      ([id, config]) =>
        !featureTypes || featureTypes.includes(config.featureType)
    );

  return Array.from(new Set(configs));
}

export function recursiveCoordinateSwap(coords: any[]) {
  const nCoords: any[] = [];
  let i = 0;
  for (i; i < coords.length; i++) {
    const coord = coords[i];
    const c1 = coord[0];
    if (typeof c1 !== 'number') {
      nCoords.push(recursiveCoordinateSwap(coord));
    } else if (typeof c1 === 'number') {
      nCoords.push([coord[1], c1]);
    }
  }
  return nCoords;
}

export function isCoordWithingBoundingBox(
  bbox: [number, number, number, number],
  coord: LatLngTuple,
  xIndex = 1,
  yIndex = 0
) {
  const [x1, y1, x2, y2] = bbox;
  const y = coord[yIndex];
  const x = coord[xIndex];

  if (x1 <= x && x <= x2 && y1 <= y && y <= y2) {
    return true;
  }

  return false;
}

// Flatten GeoJSON for easy processing
function flatten(input: any[]) {
  const flattened: LatLngTuple[] = [];
  for (const value of input) {
    if (Array.isArray(value) && typeof value[0] === 'number') {
      flattened.push(value as LatLngTuple);
    } else if (Array.isArray(value)) {
      flattened.push(...flatten(value));
    }
  }
  return flattened;
}

function getPolygonBoundingBox(
  points: LatLngTuple[]
): [number, number, number, number] {
  const xCoords = points.map((p) => p[0]);
  const yCoords = points.map((p) => p[1]);

  const x1 = Math.min(...xCoords);
  const y1 = Math.min(...yCoords);
  const x2 = Math.max(...xCoords);
  const y2 = Math.max(...yCoords);

  return [x1, y1, x2, y2];
}

export function filterPolylineFeaturesWithinBoundingBox(
  features: MaFeature[],
  bbox: [number, number, number, number]
) {
  const featuresFiltered = [];
  const hasCoord = (coord: LatLngTuple) =>
    isCoordWithingBoundingBox(bbox, coord);

  let i = 0;
  let len = features.length;

  for (i; i < len; i += 1) {
    const coords = flatten(features[i].geometry.coordinates);
    if (
      coords.some(hasCoord) ||
      // Checks if the boundingbox is covered by the Polygon
      isCoordWithingBoundingBox(
        getPolygonBoundingBox(coords),
        bbox.slice(0, 2) as LatLngTuple
      )
    ) {
      featuresFiltered.push(features[i]);
    }
  }

  return featuresFiltered;
}

export function filterPointFeaturesWithinBoundingBox(
  features: MaFeature[],
  bbox: [number, number, number, number]
) {
  const featuresFiltered = [];

  let i = 0;
  let len = features.length;

  for (i; i < len; i += 1) {
    if (
      isCoordWithingBoundingBox(
        bbox,
        features[i].geometry.coordinates as LatLngTuple,
        0,
        1
      )
    ) {
      featuresFiltered.push(features[i]);
    }
  }

  return featuresFiltered;
}

export function getDynamicDatasetFilters(datasetId: DatasetId) {
  const datasetCategoryId = getDatasetCategoryId(datasetId);

  if (!datasetCategoryId) {
    return;
  }

  // Check if this dataset has filtering possibilities
  const propertyFilters =
    DATASETS[datasetCategoryId].datasets[datasetId]?.filters;

  if (!propertyFilters) {
    return;
  }

  // Only select property filters that don't have static values defined.
  return Object.fromEntries(
    Object.entries(propertyFilters).filter(([propertyId, property]) => {
      return !property.values?.length;
    })
  );
}

export function createDynamicFilterConfig(
  datasetId: DatasetId,
  features: MaFeature[],
  filterConfig: DatasetPropertyFilter
) {
  const propertyNames = Object.keys(filterConfig);
  const filters: DatasetPropertyFilter = {};

  for (const feature of features) {
    const featureProps = feature?.properties || feature;

    if (featureProps.datasetId !== datasetId) {
      continue;
    }

    for (const propertyName of propertyNames) {
      // Exlcude all features if they don't have the desired property.
      if (!(propertyName in featureProps)) {
        continue;
      }

      // Get property value from object.filters or from object itself
      const value = capitalizeFirstLetter(
        String((feature?.properties || feature)[propertyName])
      );

      // Check if value is excluded
      if (filterConfig[propertyName]?.excludeValues?.includes(value)) {
        continue;
      }

      if (!filters[propertyName]) {
        const values: DatasetPropertyValueWithCount = {};
        // Set incoming values to 0
        if (filterConfig[propertyName].values) {
          // Assumes value is already capitalized;
          for (const value of Object.keys(filterConfig[propertyName].values!)) {
            values[value] = 0;
          }
        }
        filters[propertyName] = {
          values,
        };
      }

      // Count the values in the dataset
      const values = filters[propertyName].values!;
      values[value] = (values[value] || 0) + 1;
      filters[propertyName].values = values;
    }
  }

  return filters;
}

// Matches feature properties to requested filters
function isFilterMatch(feature: MaFeature, filters: DatasetPropertyFilter) {
  return Object.entries(filters).every(([propertyName, valueConfig]) => {
    const propertyValues = valueConfig.values;
    const propVal = feature.properties[propertyName];
    const isFilteredValue = propertyValues ? propVal in propertyValues : false;

    return propertyValues
      ? !Object.keys(propertyValues).length || isFilteredValue
      : true;
  });
}

export function filterDatasetFeatures(
  features: DatasetFeatures,
  activeDatasetIds: DatasetId[],
  filters: DatasetFilterSelection
) {
  return features
    .filter((feature): feature is MaPointFeature => {
      return activeDatasetIds.includes(feature.properties.datasetId);
    })
    .filter((feature) => {
      if (filters[feature.properties.datasetId]) {
        return isFilterMatch(feature, filters[feature.properties.datasetId]);
      }
      // Always return true if dataset is unfiltered. Meaning, show everything.
      return true;
    });
}

export function refineFilterSelection(
  features: MaFeature[],
  filtersBase: DatasetFilterSelection
) {
  const filtersRefined = jsonCopy(filtersBase) as DatasetFilterSelection;

  for (const [datasetId, filters] of Object.entries(filtersBase)) {
    for (const [propertyName, propertyFilterConfig] of Object.entries(
      filters
    )) {
      if (propertyFilterConfig.values) {
        const refined = createDynamicFilterConfig(datasetId, features, filters);

        if (refined[propertyName]) {
          filtersRefined[datasetId][propertyName].valuesRefined =
            refined[propertyName].values;
        } else if (filtersBase[datasetId][propertyName].values) {
          // No features provided so we return a refined selection with 0 count
          const valuesRefined: DatasetPropertyValueWithCount = {};
          for (const value of Object.keys(
            filtersBase[datasetId][propertyName].values!
          )) {
            valuesRefined[value] = 0;
          }
          filtersRefined[datasetId][propertyName].valuesRefined = valuesRefined;
        }
      }
    }
  }
  return filtersRefined;
}

export function filterAndRefineFeatures(
  featuresBase: DatasetFeatures,
  datasetIds: DatasetId[],
  filterSelection: DatasetFilterSelection,
  filtersBase: DatasetFilterSelection
) {
  const featuresFiltered = filterDatasetFeatures(
    featuresBase,
    datasetIds,
    filterSelection
  );

  const filtersRefined = refineFilterSelection(featuresFiltered, filtersBase);

  return {
    filters: filtersRefined,
    features: featuresFiltered,
  };
}

export function getPropertyFilters(datasetId: DatasetId) {
  const datasetCategoryId = getDatasetCategoryId(datasetId);

  if (!datasetCategoryId) {
    return;
  }
  return DATASETS[datasetCategoryId].datasets[datasetId]?.filters;
}

export function createFeaturePropertiesFromPropertyFilterConfig(
  datasetId: DatasetId,
  featureProperties: MaFeature['properties'],
  featureSourceProperties: any
) {
  const propertyFilters = getPropertyFilters(datasetId);
  const filterPropertyNames = propertyFilters
    ? Object.keys(propertyFilters)
    : [];
  const staticPropertyNames = datasetEndpoints[datasetId]
    ? datasetEndpoints[datasetId].additionalStaticPropertyNames
    : [];

  if (filterPropertyNames && featureSourceProperties) {
    for (const propertyName of filterPropertyNames) {
      const valueConfig =
        propertyFilters && propertyFilters[propertyName].valueConfig;

      // Simple normalization of the value here. It only transforms 'ja' to 'Ja'.
      const value = capitalizeFirstLetter(
        String(
          featureSourceProperties?.properties
            ? featureSourceProperties.properties[propertyName]
            : featureSourceProperties[propertyName]
        )
      );

      featureProperties[propertyName] = value;

      // Apply a data transformation to the value.
      if (valueConfig && valueConfig[value]?.title) {
        featureProperties[propertyName] = valueConfig[value].title;
      }
    }
  }

  // Also add the static property names to the feature properties
  if (staticPropertyNames && featureSourceProperties) {
    for (const propertyName of staticPropertyNames) {
      featureProperties[propertyName] = featureSourceProperties?.properties
        ? featureSourceProperties.properties[propertyName]
        : featureSourceProperties[propertyName];
    }
  }
  return featureProperties;
}

export function datasetApiResult(
  results: ApiResponse<DatasetResponse | null>[]
) {
  const errors = results
    .filter(
      (result): result is ApiErrorResponse<null> => result.status === 'ERROR'
    )
    .map((result) => ({ id: result.id, message: result.message }));

  const responses = results.filter(
    (result): result is ApiSuccessResponse<DatasetResponse> =>
      result.status === 'OK' && result.content !== null
  );

  return {
    features: responses.flatMap((response) => response.content.features),
    filters: Object.fromEntries(
      responses
        .filter((response) => !!response.content.filters)
        .map((response) => [response.id, response.content.filters])
    ) as DatasetFilterSelection,
    errors,
  };
}

export function getPolylineColor(datasetId: DatasetId, feature: any) {
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

export function transformDsoApiListResponse(
  datasetId: DatasetId,
  config: DatasetConfig,
  responseData: any,
  embeddedDatasetId?: string
) {
  const results = responseData?.features
    ? responseData?.features
    : getApiEmbeddedResponse(embeddedDatasetId || datasetId, responseData);

  const collection: DatasetFeatures = [];

  if (results && results.length) {
    for (const feature of results) {
      if (feature.geometry?.coordinates) {
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
          feature.geometry.type
        );

        if (hasShapeGeometry) {
          properties.color = getPolylineColor(datasetId, feature);
          if (config?.zIndex) {
            properties.zIndex = config.zIndex;
          }
          // Swap the coordinates of the polyline datasets so leaflet can render them easily on the front-end.
          feature.geometry.coordinates = recursiveCoordinateSwap(
            feature.geometry.coordinates
          );
        }

        collection.push({
          type: 'Feature',
          geometry: feature.geometry,
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
