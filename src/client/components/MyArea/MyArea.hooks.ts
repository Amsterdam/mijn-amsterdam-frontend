import { useMemo } from 'react';
import {
  atom,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import { DatasetCollection } from '../../../server/services/buurt/datasets';
import { useDatasetControlItems } from './MyAreaDatasetControl';

export function useActiveDatasetIds() {
  const datasetControlItems = useDatasetControlItems();
  const activeDatasetIds: string[] = useMemo(() => {
    return datasetControlItems.flatMap((datasetControlItem) =>
      datasetControlItem.collection
        .filter((dataset) => dataset.isActive)
        .map((dataset) => dataset.id)
    );
  }, [datasetControlItems]);

  return activeDatasetIds;
}

export function useActiveDatasetIdsToFetch(
  featuresToCompare: DatasetCollection
) {
  const activeDatasetIds = useActiveDatasetIds();

  return useMemo(() => {
    const loadedIds = Array.from(
      new Set(featuresToCompare.map((feature) => feature.properties.datasetId))
    );
    const datasetIdsToLoad = activeDatasetIds.filter(
      (datasetId) => !loadedIds.includes(datasetId)
    );
    return datasetIdsToLoad;
  }, [activeDatasetIds, featuresToCompare]);
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
