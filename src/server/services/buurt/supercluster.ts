import memoryCache from 'memory-cache';
import Supercluster, { AnyProps, PointFeature } from 'supercluster';
import {
  DatasetFilterSelection,
  DatasetId,
} from '../../../universal/config/buurt';
import { filterDatasetFeatures, loadDatasetFeatures } from './buurt';
import { MaPointFeature } from './datasets';
import { getDatasetEndpointConfig } from './helpers';

const superClusterCache = new memoryCache.Cache<string, any>();
const cacheKey = (ids: DatasetId[], filters: DatasetFilterSelection) => {
  // TODO: Add filters to cache key
  return ids.sort().join('-');
};

async function generateSuperCluster(features: MaPointFeature[]) {
  if (!!features?.length) {
    const superClusterIndex = new Supercluster({
      log: true,
      radius: 40,
      extent: 2500,
      nodeSize: 512,
      maxZoom: 14,
    }).load(features);
    return superClusterIndex;
  }
}

function addExpansionZoom(superClusterIndex: any, feature: any) {
  try {
    feature.properties.expansion_zoom = superClusterIndex.getClusterExpansionZoom(
      feature.properties.cluster_id
    );
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
  sessionID: SessionID,
  { bbox, zoom, datasetIds, filters }: SuperClusterQuery
) {
  const activeCacheKey = cacheKey(datasetIds, filters);

  if (superClusterCache.get(activeCacheKey)) {
    return superClusterCache.get(activeCacheKey);
  }

  const configs = getDatasetEndpointConfig(datasetIds, ['Point']);
  const {
    features,
    filters: filterSelection,
    errors,
  } = await loadDatasetFeatures(sessionID, configs);

  let clusters: PointFeature<AnyProps>[] = [];

  const filteredFeatures = filterDatasetFeatures(features, datasetIds, filters);

  const superClusterIndex = await generateSuperCluster(filteredFeatures);

  if (superClusterIndex && bbox && zoom) {
    clusters = superClusterIndex.getClusters(bbox, zoom);

    for (const feature of clusters) {
      addExpansionZoom(superClusterIndex, feature);
    }
  }

  return {
    clusters,
    filters: filterSelection,
    errors,
  };
}
