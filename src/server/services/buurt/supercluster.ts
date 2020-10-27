import { featureGroup } from 'leaflet';
import memoryCache from 'memory-cache';
import Supercluster from 'supercluster';
import { loadServicesMapDatasets } from './buurt';
import {
  BUURT_CACHE_TTL_HOURS,
  DatasetCollection,
  MaPointFeature,
} from './datasets';

let dataStore: any;

const superClusterCache = new memoryCache.Cache<string, any>();

function filterDatastore(
  dataStore: DatasetCollection,
  activeDatasetIds: string[]
) {
  return dataStore.filter((feature, index): feature is MaPointFeature => {
    return (
      feature.geometry.type === 'Point' &&
      activeDatasetIds.includes(feature.properties.datasetId)
    );
  });
}

const cacheKey = (ids: string[]) => ids.sort().join('-');

async function generateSuperCluster(
  sessionID: SessionID,
  activeDatasetIds: string[] = []
) {
  const activeCacheKey = cacheKey(activeDatasetIds);

  if (superClusterCache.get(activeCacheKey)) {
    console.info('Cache hit!', activeDatasetIds);
    return superClusterCache.get(activeCacheKey);
  }

  if (!dataStore) {
    dataStore = (await loadServicesMapDatasets(sessionID)).content;
  }

  const features = filterDatastore(dataStore, activeDatasetIds);

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

  if (bbox && zoom) {
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
