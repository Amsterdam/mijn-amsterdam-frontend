import {
  DatasetConfig,
  datasetEndpoints,
  DatasetFeatures,
  MaFeature,
  MaPointFeature,
} from './datasets';
import {
  DatasetFilterSelection,
  DatasetId,
  DatasetPropertyFilter,
  DATASETS,
  getDatasetCategoryId,
} from '../../../universal/config/buurt';
import { recLookup } from '../../../universal/helpers';
import { LatLngTuple } from 'leaflet';

export function getApiEmbeddedResponse(id: string, responseData: any) {
  const results = responseData?._embedded && responseData?._embedded[id];
  return Array.isArray(results) ? results : null;
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
    if (coords.some(hasCoord)) {
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
  features: MaFeature[],
  filterConfig: DatasetPropertyFilter
) {
  const propertyNames = Object.keys(filterConfig);
  const filters: DatasetPropertyFilter = {};

  for (const feature of features) {
    for (const propertyName of propertyNames) {
      // Get property value from object.filters or from object itself
      const value = (feature?.properties || feature)[propertyName];

      // Check if value is excluded
      if (filterConfig[propertyName]?.excludeValues?.includes(value)) {
        continue;
      }

      if (!filters[propertyName]) {
        filters[propertyName] = {
          values: {},
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
  for (const [datasetId, filters] of Object.entries(filtersBase)) {
    for (const [propertyName, propertyFilterConfig] of Object.entries(
      filters
    )) {
      if (propertyFilterConfig.values) {
        const refined = createDynamicFilterConfig(features, filters);
        if (refined[propertyName]) {
          filtersBase[datasetId][propertyName].valuesRefined =
            refined[propertyName].values;
        }
      }
    }
  }
  return filtersBase;
}

export function filterAndRefineFeatures(
  featuresBase: DatasetFeatures,
  datasetIds: DatasetId[],
  filterSelection: DatasetFilterSelection,
  filtersBase: DatasetFilterSelection
) {
  let featuresFiltered = featuresBase;
  let filtersRefined = filterSelection;

  featuresFiltered = filterDatasetFeatures(
    featuresBase,
    datasetIds,
    filtersRefined
  );

  filtersRefined = refineFilterSelection(featuresFiltered, filtersBase);

  return {
    filters: filtersRefined,
    features: featuresFiltered,
  };
}
