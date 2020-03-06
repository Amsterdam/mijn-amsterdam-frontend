import { API_BASE_URL } from 'config/Api.constants';
import { LatLngTuple } from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import { useDataApi } from './api.hook';
import { ApiState } from './api.types';

const AFVALCONTAINERS_URL = API_BASE_URL + '/afvalcontainers';

export interface DatasetItem {
  id: string;
  title: string;
  latLng: LatLngTuple;
  type: string;
  [key: string]: any;
}

export interface Dataset {
  id: string;
  items: DatasetItem[];
}

export type DatasetIds = Array<Dataset['id']>;

export type DatasetApiData = ApiState<Dataset[]>;

interface DatasetGroup {
  datasets: Dataset[];
  datasetIdsLoading: DatasetIds;
  refetch: (datasetIds: string[], params?: MapDataRequestOptions) => void;
}

type MapDataApiState = Record<string, DatasetGroup>;

interface MapDataRequestOptions {
  bbox: string;
}

export default function useMapData(): MapDataApiState {
  const [cachedDatasets, storeDatasets] = useState<Dataset[]>([]);
  const [datasetsApiResponse, refetchDatasets] = useDataApi<Dataset[]>(
    {
      url: '',
      postpone: true,
    },
    []
  );

  // Extract the data from the server and cache locally
  useEffect(() => {
    if (datasetsApiResponse.data.length) {
      let updatedDatasets = cachedDatasets;
      for (const dataset of datasetsApiResponse.data) {
        if (
          dataset.items.length &&
          dataset.id &&
          !cachedDatasets.some(cDataset => cDataset.id === dataset.id)
        ) {
          updatedDatasets = [...updatedDatasets, dataset];
        }
      }
      if (updatedDatasets !== cachedDatasets) {
        storeDatasets(updatedDatasets);
      }
    }
  }, [datasetsApiResponse, cachedDatasets]);

  const [datasetIdsLoading, setDatasetIdsLoading] = useState<
    DatasetGroup['datasetIdsLoading']
  >([]);

  useEffect(() => {
    const cachedDatasetIds = cachedDatasets.map(dataset => dataset.id);
    const datasetIdsLoadingRemaining = datasetIdsLoading.filter(
      id => !cachedDatasetIds.includes(id)
    );
    // If there are updates in the cachedDatasets, update the idsLoading state.
    if (
      !datasetIdsLoading.every(
        (id, index) => datasetIdsLoadingRemaining[index] === id
      )
    ) {
      setDatasetIdsLoading(datasetIdsLoadingRemaining);
    }
  }, [cachedDatasets, datasetIdsLoading]);

  // Construct the afvalcontainers DatasetGroup
  const afvalcontainers: DatasetGroup = useMemo(() => {
    return {
      datasets: cachedDatasets,
      datasetIdsLoading,
      refetch(datasetIds: string[], params?: MapDataRequestOptions) {
        // Determine the datasets that need to be fetched, exculding the ones already loading.
        const datasetIdsToLoad = datasetIds.filter(
          id => !datasetIdsLoading.includes(id)
        );
        // Make the fetch call for the appropriate datasets
        if (datasetIdsToLoad.length) {
          refetchDatasets({
            url: AFVALCONTAINERS_URL,
            params: {
              ...params,
              types: datasetIdsToLoad,
            },
          });
          // Store the id's of currently loading datasets so we can use them for optimalisation and loading indicators
          setDatasetIdsLoading(loadingDatasetIds => [
            ...loadingDatasetIds,
            ...datasetIdsToLoad,
          ]);
        }
      },
    };
  }, [cachedDatasets, refetchDatasets, datasetIdsLoading]);

  // TODO: Some efficient data loading
  return useMemo(
    () => ({
      afvalcontainers,
    }),
    [afvalcontainers]
  );
}
