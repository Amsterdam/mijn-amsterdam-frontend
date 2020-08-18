// or require in Node / Browserify
import Supercluster from 'supercluster';
import { loadServicesMapDatasets } from './services-map';

let currentlyActiveDatasetIds: string[] = [];
let dataStore: any;
let superClusterIndex: Supercluster;

function filterDatastore(dataStore: any, activeDatasetIds: any) {
  return dataStore.flatMap(({ datasets, id }: any) =>
    Object.entries(datasets)
      .filter(([datasetId, coordinates]) =>
        activeDatasetIds.includes(datasetId)
      )
      .flatMap(([datasetId, coordinates]: any) => {
        return coordinates.map((coordinates: any) => {
          return {
            geometry: {
              type: 'Point',
              coordinates,
            },
            properties: {
              dataset: [id, datasetId],
            },
            type: 'Feature',
          };
        });
      })
  );
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
    dataStore = (await loadServicesMapDatasets()).content;
  }

  console.log('hasChangedDatasetIds:', hasChangedDatasetIds, activeDatasetIds);

  if (!superClusterIndex || hasChangedDatasetIds) {
    const coordinates = filterDatastore(dataStore, activeDatasetIds);
    console.log('generate new');
    superClusterIndex = new Supercluster({
      log: true,
      radius: 40,
      extent: 2500,
      nodeSize: 512,
      maxZoom: 16,
    }).load(coordinates);
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
  console.log('\n\ngetClusterData.parentid:\n\n', parentId);
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
