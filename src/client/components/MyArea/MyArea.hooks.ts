import { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  atom,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import {
  DatasetFeatures,
  MaPointFeature,
  MaPolyLineFeature,
} from '../../../server/services/buurt/datasets';
import { useDatasetControlItems } from './MyAreaDatasetControl';
import axios, { AxiosResponse } from 'axios';
import { BFFApiUrls } from '../../config/api';
import { LeafletEvent } from 'leaflet';
import { useMapInstance } from '@amsterdam/react-maps';
import { ApiResponse } from '../../../universal/helpers';
import styles from './MyAreaSuperCluster.module.scss';
import { MaSuperClusterFeature } from '../../../server/services/buurt/datasets';

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

export function useActiveDatasetIdsToFetch(featuresToCompare: DatasetFeatures) {
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

interface SelectedFeature {
  datasetId?: string;
  id?: string;
  markerData?: any | null;
}

export const selectedFeatureAtom = atom<SelectedFeature | null>({
  key: 'selectedFeature',
  default: null,
});

export function useSelectedFeature() {
  return useRecoilState(selectedFeatureAtom);
}

export function useSelectedFeatureValue() {
  return useRecoilValue(selectedFeatureAtom);
}

export function useSetSelectedFeature() {
  return useSetRecoilState(selectedFeatureAtom);
}

export function useFetchPanelFeature() {
  const params = useParams<{
    datasetId?: string;
    id?: string;
  }>();
  const [selectedFeatureState, setSelectedFeature] = useSelectedFeature();

  const selectedFeature = useMemo(() => {
    if (!selectedFeatureState) {
      return {
        ...params,
      };
    }
    return selectedFeatureState;
  }, [selectedFeatureState, params]);

  const { datasetId, id } = selectedFeature;

  useEffect(() => {
    if (!id || !datasetId) {
      return;
    }

    axios({
      url: `${BFFApiUrls.MAP_DATASETS}/${datasetId}/${id}`,
    })
      .then(({ data: { content: markerData } }) => {
        setSelectedFeature({
          id,
          datasetId,
          markerData,
        });
      })
      .catch((error) => {
        setSelectedFeature({
          id,
          datasetId,
          markerData: 'error',
        });
      });
  }, [datasetId, id, setSelectedFeature]);
}

const selectedFeatureSelector = styles['MarkerIcon--selected'];

export function useSelectedFeatureCSS(features: MaSuperClusterFeature[]) {
  const selectedFeature = useSelectedFeatureValue();
  const map = useMapInstance();

  useEffect(() => {
    if (map) {
      console.log('selected!', selectedFeature?.id);
      map.eachLayer((layer: any) => {
        const id = layer?.feature?.properties?.id;
        if (id === selectedFeature?.id && layer.getElement) {
          const element = layer.getElement();
          // Add selected class to marker
          document
            ?.querySelector(`.${selectedFeatureSelector}`)
            ?.classList.remove(selectedFeatureSelector);
          element.classList.add(selectedFeatureSelector);
        }
      });
    }
  }, [map, selectedFeature?.id, features]);
}

export function useOnMarkerClick() {
  const setSelectedFeature = useSetSelectedFeature();

  return useCallback(
    (event: LeafletEvent) => {
      const id = event?.propagatedFrom?.feature?.properties?.id;
      const datasetId = event?.propagatedFrom?.feature?.properties?.datasetId;

      // Using DOM access here because comparing against selectedFeature will invalidate the memoized calback constantly which re-renders the layer component
      if (
        !event.propagatedFrom
          .getElement()
          .classList.contains(selectedFeatureSelector)
      ) {
        setSelectedFeature({
          datasetId,
          id,
        });
      }
    },
    [setSelectedFeature]
  );
}

export function useFetchFeatures({
  setClusterFeatures,
  setPolyLineFeatures,
}: {
  setClusterFeatures: (features: MaPointFeature[]) => void;
  setPolyLineFeatures: (features: MaPolyLineFeature[]) => void;
}) {
  const map = useMapInstance();

  const fetch = useCallback(
    async (payload = {}) => {
      const response: AxiosResponse<ApiResponse<DatasetFeatures>> = await axios(
        {
          url: BFFApiUrls.MAP_DATASETS,
          data: payload,
          method: 'POST',
        }
      );
      const features = response.data?.content;
      if (features) {
        const clusterFeatures = features?.filter(
          (feature): feature is MaPointFeature =>
            feature.geometry.type === 'Point'
        );
        const polyLineFeatures = features?.filter(
          (feature): feature is MaPolyLineFeature =>
            feature.geometry.type === 'MultiPolygon' ||
            feature.geometry.type === 'MultiLineString'
        );

        if (clusterFeatures) {
          setClusterFeatures(clusterFeatures);
        }
        if (polyLineFeatures) {
          setPolyLineFeatures(polyLineFeatures);
        }
      }
    },
    [setPolyLineFeatures, setClusterFeatures]
  );

  const fetchFeatures = useCallback(
    (datasetIds: string[]) => {
      if (!map) {
        return;
      }
      const bounds = map.getBounds();

      return fetch({
        datasetIds,
        bbox: [
          bounds.getWest(),
          bounds.getSouth(),
          bounds.getEast(),
          bounds.getNorth(),
        ],
        zoom: map.getZoom(),
      });
    },
    [map, fetch]
  );

  return fetchFeatures;
}
