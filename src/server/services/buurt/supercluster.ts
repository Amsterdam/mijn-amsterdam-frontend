import memoryCache from 'memory-cache';
import Supercluster from 'supercluster';
import { filterDatasetFeatures, loadDatasetFeatures } from './buurt';
import { MaPointFeature } from './datasets';
import { getDatasetEndpointConfig } from './helpers';

const superClusterCache = new memoryCache.Cache<string, any>();
const cacheKey = (ids: string[]) => ids.sort().join('-');

async function generateSuperCluster(features: MaPointFeature[]) {
  if (!!features?.length) {
    const superClusterIndex = new Supercluster({
      log: true,
      radius: 40,
      extent: 2500,
      nodeSize: 512,
      maxZoom: 15,
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
  datasetIds: string[];
}

export async function loadClusterDatasets(
  sessionID: SessionID,
  { bbox, zoom, datasetIds }: SuperClusterQuery
) {
  const activeCacheKey = cacheKey(datasetIds);

  if (superClusterCache.get(activeCacheKey)) {
    return superClusterCache.get(activeCacheKey);
  }

  const configs = getDatasetEndpointConfig(datasetIds, ['Point']);
  const { features, errorResults } = (
    await loadDatasetFeatures(sessionID, configs)
  ).content;

  const filterFeatures = filterDatasetFeatures(features, datasetIds);

  const superClusterIndex = await generateSuperCluster(filterFeatures);

  if (superClusterIndex && bbox && zoom) {
    const clusters = superClusterIndex.getClusters(bbox, zoom);
    for (const feature of clusters) {
      addExpansionZoom(superClusterIndex, feature);
      // feature.geometry.coordinates = [
      //   feature.geometry.coordinates[1],
      //   feature.geometry.coordinates[0],
      // ];
    }
    return {
      clusters,
      errorResults,
    };
  }

  return null;
}
