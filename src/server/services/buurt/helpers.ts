import { DatasetConfig, datasetEndpoints } from './datasets';
import { DATASETS } from '../../../universal/config/buurt';

export function getApiEmbeddedResponse(id: string, responseData: any) {
  const results = responseData?._embedded && responseData?._embedded[id];
  return Array.isArray(results) ? results : null;
}

export function getDatasetEndpointConfig(
  endpointIDs?: string[],
  featureTypes?: DatasetConfig['featureType'][]
) {
  const configs: Array<[string, DatasetConfig]> = Object.entries(
    datasetEndpoints
  )
    .filter(([id, config]) => {
      const hasDatasetId =
        DATASETS[id] &&
        Object.keys(DATASETS[id].datasets).some((datasetId) =>
          endpointIDs?.includes(datasetId)
        );
      const isEndpoint = endpointIDs?.includes(id);

      return !endpointIDs || isEndpoint || hasDatasetId;
    })
    .filter(
      ([id, config]) =>
        !featureTypes || featureTypes.includes(config.featureType)
    );

  return Array.from(new Set(configs));
}

export function recursiveCoordinateSwap(coords: any[]) {
  const nCoords: any[] = [];
  let i = 0;
  for (i; i < coords.length; i++) {
    const coord = coords[i];
    const c1 = coord[0];
    if (typeof c1 !== 'number') {
      nCoords.push(recursiveCoordinateSwap(coord));
    } else if (typeof c1 === 'number') {
      nCoords.push([coord[1], c1]);
    }
  }
  return nCoords;
}
