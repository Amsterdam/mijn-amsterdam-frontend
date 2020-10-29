import axios from 'axios';
import { useCallback, useMemo, useState } from 'react';
import {
  atom,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import {
  DatasetCollection,
  MaPolyLineFeature,
} from '../../../server/services/buurt/datasets';
import { ApiSuccessResponse } from '../../../universal/helpers';
import { RefetchFunction } from '../../hooks/api/useDataApi';
import { LayerType } from './datasets';
import {
  createClusterDatasetMarkers,
  recursiveCoordinateSwap,
} from './MyArea.helpers';
import { useDatasetControlItems } from './MyAreaDatasetControl';

export const featuresAtom = atom<DatasetCollection>({
  key: 'featuresAtom',
  default: [],
});

export function useFeatures(): [DatasetCollection, RefetchFunction] {
  const [features, setFeatures] = useState<DatasetCollection>([]);
  const fetchDatasets = useCallback(
    async (requestOptions) => {
      const response: {
        data: ApiSuccessResponse<DatasetCollection>;
      } = await axios(requestOptions);
      setFeatures((features) => [...features, ...response.data.content]);
    },
    [setFeatures]
  );

  return [features, fetchDatasets];
}

export function useDatasetMarkers(features: DatasetCollection) {
  return useMemo(() => {
    if (!features) {
      return [];
    }
    return createClusterDatasetMarkers(features);
  }, [features]);
}

export function useActiveDatasetIds(layerType?: LayerType) {
  const datasetControlItems = useDatasetControlItems();
  const activeDatasetIds: string[] = useMemo(() => {
    return datasetControlItems.flatMap((datasetControlItem) =>
      datasetControlItem.collection
        .filter((dataset) => {
          return (
            dataset.isActive && (!layerType || dataset.layerType === layerType)
          );
        })
        .map((dataset) => dataset.id)
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

export function useActivePolyLineFeatures(): [
  MaPolyLineFeature[],
  RefetchFunction
] {
  const [features, fetchFeatures] = useFeatures();
  const activePolyLineDatasetIds = useActivePolyLineDatasetIds();

  const polyLineFeatures = useMemo(() => {
    return features
      .filter((feature): feature is MaPolyLineFeature =>
        activePolyLineDatasetIds.includes(feature.properties.datasetId)
      )
      .map((feature) => {
        return {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: recursiveCoordinateSwap(feature.geometry.coordinates),
          },
        };
      });
  }, [features, activePolyLineDatasetIds]);

  return [polyLineFeatures, fetchFeatures];
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
