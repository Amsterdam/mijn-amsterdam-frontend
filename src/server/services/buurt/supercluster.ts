import memoryCache from 'memory-cache';
import Supercluster from 'supercluster';
import { loadDatasetFeatures } from './buurt';
import {
  BUURT_CACHE_TTL_HOURS,
  DatasetFeatures,
  MaPointFeature,
} from './datasets';
import { getDatasetEndpointConfig } from './helpers';

const superClusterCache = new memoryCache.Cache<string, any>();

function filterDatasetFeatures(
  features: DatasetFeatures,
  activeDatasetIds: string[]
) {
  return features.filter((feature, index): feature is MaPointFeature => {
    return activeDatasetIds.includes(feature.properties.datasetId);
  });
}

const cacheKey = (ids: string[]) => ids.sort().join('-');

async function generateSuperCluster(
  sessionID: SessionID,
  datasetIds: string[] = []
) {
  const activeCacheKey = cacheKey(datasetIds);

  if (superClusterCache.get(activeCacheKey)) {
    return superClusterCache.get(activeCacheKey);
  }

  const configs = getDatasetEndpointConfig(datasetIds, ['Point']);
  const datasetFeatures = (await loadDatasetFeatures(sessionID, configs))
    .content;
  console.log('d:', datasetFeatures.length);
  if (!!datasetFeatures?.length) {
    const features = filterDatasetFeatures(datasetFeatures, datasetIds);

    const superClusterIndex = new Supercluster({
      log: true,
      radius: 40,
      extent: 2500,
      nodeSize: 512,
      maxZoom: 15,
    }).load(features);

    superClusterCache.put(
      activeCacheKey,
      superClusterIndex,
      BUURT_CACHE_TTL_HOURS * 1000 * 60 // HOURS * 60 seconds
    );

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
  const superClusterIndex = await generateSuperCluster(sessionID, datasetIds);

  if (superClusterIndex && bbox && zoom) {
    const data = superClusterIndex.getClusters(bbox, zoom);
    for (const feature of data) {
      addExpansionZoom(superClusterIndex, feature);
      // feature.geometry.coordinates = [
      //   feature.geometry.coordinates[1],
      //   feature.geometry.coordinates[0],
      // ];
    }
    return data;
  }

  return null;
}
