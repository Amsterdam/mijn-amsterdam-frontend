// or require in Node / Browserify
import Supercluster from 'supercluster';
import { loadServicesMapDatasets } from './buurt';

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

async function generateSuperCluster(activeDatasetIds: string[] = []) {
  let hasChangedDatasetIds = false;

  if (currentlyActiveDatasetIds.length) {
    if (activeDatasetIds.length !== currentlyActiveDatasetIds.length) {
      hasChangedDatasetIds = true;
    } else {
      return (
        currentlyActiveDatasetIds.some(
          (id: string) => !activeDatasetIds.includes(id)
        ) ||
        activeDatasetIds.some((id) => !currentlyActiveDatasetIds.includes(id))
      );
    }
  }

  currentlyActiveDatasetIds = activeDatasetIds;

  if (!dataStore) {
    dataStore = (await loadServicesMapDatasets('x-ws')).content;
  }

  if (!superClusterIndex || hasChangedDatasetIds) {
    const features = filterDatastore(dataStore, activeDatasetIds);
    superClusterIndex = new Supercluster({
      log: true,
      radius: 40,
      extent: 2500,
      nodeSize: 512,
      maxZoom: 15,
    }).load(features);
  }
}

export async function getClusterData({
  getClusterExpansionZoom,
  center,
  bbox,
  zoom,
  datasetIds,
  parentId,
}: any) {
  await generateSuperCluster(datasetIds || currentlyActiveDatasetIds);

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
    return { data: superClusterIndex.getClusters(bbox, zoom) };
  }

  return { ready: true };
}
