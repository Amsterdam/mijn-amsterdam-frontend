import { DatasetConfig, datasetEndpoints } from './datasets';
import { DATASETS } from '../../../universal/config/buurt';

export function getApiEmbeddedResponse(id: string, responseData: any) {
  const results = responseData?._embedded && responseData?._embedded[id];
  return Array.isArray(results) ? results : null;
}

export function getDatasetEndpointConfig(datasetId?: string) {
  const configs: Array<[string, DatasetConfig]> = Object.entries(
    datasetEndpoints
  ).filter(
    ([id, config]) =>
      !datasetId ||
      id === datasetId ||
      (DATASETS[id] && DATASETS[id].includes(datasetId))
  );

  return configs;
}
