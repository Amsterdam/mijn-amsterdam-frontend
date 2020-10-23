import axios from 'axios';
import { useCallback, useMemo } from 'react';
import {
  atom,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import { RefetchFunction } from '../../hooks/api/useDataApi';
import { DatasetsSource, LayerType } from './datasets';
import { createClusterDatasetMarkers } from './MyArea.helpers';
import { useDatasetControlItems } from './MyAreaDatasetControl';

export const datasetGroupsAtom = atom<DatasetsSource[]>({
  key: 'datasetGroupsAtom',
  default: [],
});

export function useDatasetGroups(
  layerType?: LayerType
): [DatasetsSource[], RefetchFunction] {
  const [datasetGroups, setDatasetGroups] = useRecoilState(datasetGroupsAtom);
  const fetchDatasets = useCallback(
    async (requestOptions) => {
      const response = await axios(requestOptions);
      setDatasetGroups((datasetGroups) => [
        ...datasetGroups,
        ...response.data.content,
      ]);
    },
    [setDatasetGroups]
  );

  return [datasetGroups, fetchDatasets];
}

export function useDatasetMarkers() {
  const [datasetsSource] = useDatasetGroups();
  return useMemo(() => {
    if (!datasetsSource) {
      return [];
    }
    return createClusterDatasetMarkers(datasetsSource);
  }, [datasetsSource]);
}

export function useActiveDatasetIds(layerType?: LayerType) {
  const datasetControlItems = useDatasetControlItems();
  const activeDatasetIds: Array<string[]> = useMemo(() => {
    return datasetControlItems.flatMap((datasetControlItem) =>
      datasetControlItem.collection
        .filter(
          (dataset) =>
            dataset.isActive && (!layerType || dataset.layerType === layerType)
        )
        .map((dataset) => [datasetControlItem.id, dataset.id])
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
  datasetGroupId?: string;
  datasetId?: string;
  datasetItemId?: string;
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
