import axios from 'axios';
import { useCallback, useMemo } from 'react';
import {
  atom,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import { DatasetCollection } from '../../../server/services/buurt/datasets';
import { ApiSuccessResponse } from '../../../universal/helpers';
import { RefetchFunction } from '../../hooks/api/useDataApi';
import { LayerType } from './datasets';
import { createClusterDatasetMarkers } from './MyArea.helpers';
import { useDatasetControlItems } from './MyAreaDatasetControl';

export const datasetGroupsAtom = atom<DatasetCollection>({
  key: 'datasetGroupsAtom',
  default: [],
});

export function useDatasetGroups(
  layerType?: LayerType
): [DatasetCollection, RefetchFunction] {
  const [datasetGroups, setDatasetGroups] = useRecoilState(datasetGroupsAtom);
  const fetchDatasets = useCallback(
    async requestOptions => {
      const response: {
        data: ApiSuccessResponse<DatasetCollection>;
      } = await axios(requestOptions);
      setDatasetGroups(datasetGroups => [
        ...datasetGroups,
        ...response.data.content,
      ]);
    },
    [setDatasetGroups]
  );

  return [datasetGroups, fetchDatasets];
}

export function useDatasetMarkers() {
  const [datasetGroups] = useDatasetGroups();
  return useMemo(() => {
    if (!datasetGroups) {
      return [];
    }
    return createClusterDatasetMarkers(datasetGroups);
  }, [datasetGroups]);
}

export function useActiveDatasetIds(layerType?: LayerType) {
  const datasetControlItems = useDatasetControlItems();
  const activeDatasetIds: string[] = useMemo(() => {
    return datasetControlItems.flatMap(datasetControlItem =>
      datasetControlItem.collection
        .filter(
          dataset =>
            dataset.isActive && (!layerType || dataset.layerType === layerType)
        )
        .map(dataset => dataset.id)
    );
  }, [datasetControlItems, layerType]);

  return activeDatasetIds;
}

export function useActiveClusterDatasetIds() {
  return useActiveDatasetIds(LayerType.Cluster);
}

export function useActivePolyLineDatasetIds() {
  return useActiveDatasetIds(LayerType.PolyLine);
}

interface SelectedMarkerData {
  datasetId?: string;
  id?: string;
  markerData?: any | null;
}

export const selectedMarkerDataAtom = atom<SelectedMarkerData | null>({
  key: 'selectedMarkerData',
  default: null,
});

export function useSelectedMarkerData() {
  return useRecoilState(selectedMarkerDataAtom);
}

export function useSelectedMarkerDataValue() {
  return useRecoilValue(selectedMarkerDataAtom);
}

export function useSetSelectedMarkerData() {
  return useSetRecoilState(selectedMarkerDataAtom);
}
