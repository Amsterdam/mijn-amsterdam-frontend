import { useMapInstance } from '@amsterdam/react-maps';
import axios, { AxiosResponse } from 'axios';
import { LeafletEvent } from 'leaflet';
import { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  atom,
  RecoilState,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import {
  DatasetFeatures,
  MaPointFeature,
  MaPolyLineFeature,
  MaSuperClusterFeature,
} from '../../../server/services/buurt/datasets';
import { ApiResponse } from '../../../universal/helpers';
import { BFFApiUrls } from '../../config/api';
import styles from './MyAreaDatasets.module.scss';
import { ApiErrorResponse } from '../../../universal/helpers/api';

const activeDatasetIdsAtom: RecoilState<string[]> = atom<string[]>({
  key: 'activeDatasetIds',
  default: [],
});

export function useActiveDatasetIds() {
  return useRecoilState(activeDatasetIdsAtom);
}

export function useActiveDatasetIdsToFetch(featuresToCompare: DatasetFeatures) {
  const [activeDatasetIds] = useActiveDatasetIds();

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

const selectedFeatureSelector = styles['Feature--selected'];

export function useSelectedFeatureCSS(
  features: Array<MaSuperClusterFeature | MaPolyLineFeature>
) {
  const selectedFeature = useSelectedFeatureValue();
  const map = useMapInstance();
  const selectedFeatureId = selectedFeature?.id;

  useEffect(() => {
    if (map) {
      map.eachLayer((layer: any) => {
        const id = layer?.feature?.properties?.id;
        if (id === selectedFeatureId && layer.getElement) {
          const element = layer.getElement();
          // Add selected class to marker
          document
            ?.querySelector(`.${selectedFeatureSelector}`)
            ?.classList.remove(selectedFeatureSelector);
          element.classList.add(selectedFeatureSelector);
        }
      });
    }
  }, [map, selectedFeatureId, features]);
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
  setErrorResults,
  setFeaturesLoading,
}: {
  setClusterFeatures: (features: MaPointFeature[]) => void;
  setPolyLineFeatures: (features: MaPolyLineFeature[]) => void;
  setErrorResults: (errorResults: Array<ApiErrorResponse<null>>) => void;
  setFeaturesLoading: (isLoading: boolean) => void;
}) {
  const map = useMapInstance();

  const fetch = useCallback(
    async (payload = {}) => {
      setFeaturesLoading(true);

      const response: AxiosResponse<ApiResponse<{
        features: DatasetFeatures;
        errorResults: Array<ApiErrorResponse<null>>;
      }>> = await axios({
        url: BFFApiUrls.MAP_DATASETS,
        data: payload,
        method: 'POST',
      });

      const features = response.data?.content?.features;
      const errorResults = response.data?.content?.errorResults;

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
        if (errorResults) {
          setErrorResults(errorResults);
        }

        setFeaturesLoading(false);
      }
    },
    [
      setPolyLineFeatures,
      setClusterFeatures,
      setErrorResults,
      setFeaturesLoading,
    ]
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
