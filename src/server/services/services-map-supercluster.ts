// or require in Node / Browserify
import Supercluster from 'supercluster';
import { loadServicesMapDatasets } from './buurt/buurt';

let currentlyActiveDatasetIds: string[] = [];
let dataStore: any;
let superClusterIndex: Supercluster;

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

async function generateSuperCluster(
  sessionID: SessionID,
  activeDatasetIds: string[] = []
) {
  if (
    activeDatasetIds.length === currentlyActiveDatasetIds.length &&
    !activeDatasetIds.filter((id) => !currentlyActiveDatasetIds.includes(id))
      .length
  ) {
    return superClusterIndex;
  }

  currentlyActiveDatasetIds = activeDatasetIds;

  if (!dataStore) {
    dataStore = (await loadServicesMapDatasets(sessionID)).content;
  }

  const features = filterDatastore(dataStore, activeDatasetIds);

  superClusterIndex = new Supercluster({
    log: true,
    radius: 40,
    extent: 2500,
    nodeSize: 512,
    minPoints: 2,
    maxZoom: 14,
  } as any).load(features);

  return superClusterIndex;
}

export async function getClusterData(
  sessionID: SessionID,
  { getClusterExpansionZoom, center, bbox, zoom, datasetIds, parentId }: any
) {
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
    await generateSuperCluster(
      sessionID,
      datasetIds || currentlyActiveDatasetIds
    );
    return { data: superClusterIndex.getClusters(bbox, zoom) };
  }
}
