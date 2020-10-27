import Supercluster from 'supercluster';
import { loadServicesMapDatasets } from './buurt/buurt';
import memoryCache from 'memory-cache';
import { BUURT_CACHE_TTL_HOURS } from './buurt/datasets';

let dataStore: any;

const superClusterCache = new memoryCache.Cache<string, any>();

function filterDatastore(dataStore: any, activeDatasetIds: any) {
  return dataStore.flatMap((dataset: any) => {
    const { collection, id: datasetGroupId } = dataset;
    return Object.entries(collection)
      .filter(([datasetId, coordinates]) =>
        activeDatasetIds.includes(datasetId)
      )
      .flatMap(([datasetId, coordinates]: any) => {
        return coordinates.map((coordinates: any) => {
          return {
            geometry: {
              type: 'Point',
              coordinates: [coordinates[1], coordinates[0]],
            },
            properties: {
              dataset: [coordinates[2], datasetId, datasetGroupId],
            },
            type: 'Feature',
          };
        });
      });
  });
}

const cacheKey = (ids: string[]) => ids.sort().join('-');

async function generateSuperCluster(
  sessionID: SessionID,
  activeDatasetIds: string[] = []
) {
  const activeCacheKey = cacheKey(activeDatasetIds);

  if (superClusterCache.get(activeCacheKey)) {
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

export async function getClusterData(
  sessionID: SessionID,
  { getClusterExpansionZoom, center, bbox, zoom, datasetIds, parentId }: any
) {
  const superClusterIndex = await generateSuperCluster(sessionID, datasetIds);

  if (parentId) {
    return {
      children: superClusterIndex.getChildren(parseInt(parentId, 10)),
    };
  } else if (getClusterExpansionZoom && center) {
    return {
      expansionZoom: superClusterIndex.getClusterExpansionZoom(
        getClusterExpansionZoom
      ),
      center,
    };
  } else if (bbox && zoom) {
    const data = superClusterIndex.getClusters(bbox, zoom);
    data.forEach((feature: any) =>
      addExpansionZoom(superClusterIndex, feature)
    );
    return { data };
  }
}
