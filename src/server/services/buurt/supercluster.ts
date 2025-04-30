import Supercluster, { AnyProps, PointFeature } from 'supercluster';

import { loadDatasetFeatures } from './buurt';
import { MaFeature, MaPointFeature } from './datasets';
import {
  filterAndRefineFeatures,
  filterPointFeaturesWithinBoundingBox,
  getDatasetEndpointConfig,
} from './helpers';
import {
  DatasetFilterSelection,
  DatasetId,
} from '../../../universal/config/myarea-datasets';
import { logger } from '../../logging';

async function generateSuperCluster(features: MaPointFeature[]) {
  if (features?.length) {
    const Supercluster = (await import('supercluster')).default;
    const superClusterIndex = new Supercluster({
      log: true,
      radius: 40,
      extent: 3000,
      nodeSize: 64,
      maxZoom: 13,
    }).load(features);
    return superClusterIndex;
  }
}

function addExpansionZoom(superClusterIndex: Supercluster, feature: MaFeature) {
  try {
    if (typeof feature.properties.cluster_id === 'number') {
      feature.properties.expansion_zoom =
        superClusterIndex.getClusterExpansionZoom(
          feature.properties.cluster_id
        );
    }
  } catch (_error) {
    logger.error(
      { cluster_id: feature.properties.cluster_id, feature },
      "Can't add expansion zoom to cluster"
    );
  }
}

interface SuperClusterQuery {
  bbox: [number, number, number, number];
  zoom: number;
  datasetIds: DatasetId[];
  filters: DatasetFilterSelection;
}

export async function loadClusterDatasets({
  bbox,
  zoom,
  datasetIds,
  filters,
}: SuperClusterQuery) {
  const configs = getDatasetEndpointConfig(datasetIds, ['Point']);

  const {
    features,
    filters: filtersBase,
    errors,
  } = await loadDatasetFeatures(configs);

  const featuresWithinBoundingbox = filterPointFeaturesWithinBoundingBox(
    features,
    bbox
  );

  let clusters: PointFeature<AnyProps>[] = [];

  const { filters: filtersRefined, features: filteredFeatures } =
    filterAndRefineFeatures(
      featuresWithinBoundingbox,
      datasetIds,
      filters,
      filtersBase
    );

  const superClusterIndex = await generateSuperCluster(
    filteredFeatures as MaPointFeature[]
  );

  if (superClusterIndex && bbox && zoom) {
    clusters = superClusterIndex.getClusters(bbox, zoom);

    for (const feature of clusters) {
      addExpansionZoom(superClusterIndex, feature as MaFeature);
    }
  }

  const response = {
    clusters,
    filters: filtersRefined,
    errors,
  };

  return response;
}
