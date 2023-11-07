import { AnyProps, PointFeature } from 'supercluster';
import {
  DatasetFilterSelection,
  DatasetId,
} from '../../../universal/config/myarea-datasets';
import { loadDatasetFeatures } from './buurt';
import { MaPointFeature } from './datasets';
import {
  filterAndRefineFeatures,
  filterPointFeaturesWithinBoundingBox,
  getDatasetEndpointConfig,
} from './helpers';

async function generateSuperCluster(features: MaPointFeature[]) {
  if (!!features?.length) {
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

function addExpansionZoom(superClusterIndex: any, feature: any) {
  try {
    feature.properties.expansion_zoom =
      superClusterIndex.getClusterExpansionZoom(feature.properties.cluster_id);
  } catch (error) {
    console.error(
      "Can't add expansion zoom to cluster",
      feature.properties.cluster_id,
      feature
    );
  }
}

interface SuperClusterQuery {
  bbox: any;
  zoom: number;
  datasetIds: DatasetId[];
  filters: DatasetFilterSelection;
}

export async function loadClusterDatasets(
  requestID: requestID,
  { bbox, zoom, datasetIds, filters }: SuperClusterQuery
) {
  const configs = getDatasetEndpointConfig(datasetIds, ['Point']);

  const {
    features,
    filters: filtersBase,
    errors,
  } = await loadDatasetFeatures(requestID, configs);

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
      addExpansionZoom(superClusterIndex, feature);
    }
  }

  const response = {
    clusters,
    filters: filtersRefined,
    errors,
  };

  return response;
}
