import { useMapInstance } from '@amsterdam/react-maps';
import axios, { AxiosResponse, CancelTokenSource } from 'axios';
import { LeafletEvent } from 'leaflet';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useParams } from 'react-router-dom';
import {
  atom,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import { useDebouncedCallback } from 'use-debounce/lib';
import {
  DatasetFeatures,
  MaPointFeature,
  MaPolyLineFeature,
  MaSuperClusterFeature,
} from '../../../server/services/buurt/datasets';
import {
  DatasetFilterSelection,
  DatasetId,
  DatasetPropertyName,
  DatasetPropertyValue,
  DATASETS,
} from '../../../universal/config/buurt';
import { ApiResponse } from '../../../universal/helpers';
import {
  ApiErrorResponse,
  apiErrorResult,
} from '../../../universal/helpers/api';
import { BFFApiUrls } from '../../config/api';
import { DatasetCategoryItem, DatasetControlItem } from './datasets';
import styles from './MyAreaDatasets.module.scss';
import { filterItemCheckboxState } from './MyAreaPanels';

const activeDatasetIdsAtom = atom<string[]>({
  key: 'activeDatasetIds',
  default: [],
});

export function useActiveDatasetIds() {
  return useRecoilState(activeDatasetIdsAtom);
}

const activeDatasetFiltersAtom = atom<DatasetFilterSelection>({
  key: 'activeDatasetFilters',
  default: Object.fromEntries(
    Object.entries(DATASETS).flatMap(([categoryId, categoryConfig]) => {
      return Object.entries(categoryConfig)
        .filter(
          ([categoryId, categoryConfig]) => typeof categoryConfig === 'object'
        )
        .map(([datasetId, datasetConfig]: any) => {
          return [datasetId, datasetConfig];
        });
    })
  ),
});

export function useActiveDatasetFilters() {
  return useRecoilState(activeDatasetFiltersAtom);
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

    let source = axios.CancelToken.source();

    axios({
      url: `${BFFApiUrls.MAP_DATASETS}/${datasetId}/${id}`,
      cancelToken: source.token,
    })
      .then(({ data: { content: markerData } }) => {
        setSelectedFeature({
          id,
          datasetId,
          markerData,
        });
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          setSelectedFeature({
            id,
            datasetId,
            markerData: 'error',
          });
        }
      });

    return () => {
      source.cancel();
    };
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
  const selectedFeature = useSelectedFeatureValue();
  const selectedFeatureId = selectedFeature?.id;
  return useCallback(
    (event: LeafletEvent) => {
      const id = event?.propagatedFrom?.feature?.properties?.id;
      const datasetId = event?.propagatedFrom?.feature?.properties?.datasetId;

      // Using DOM access here because comparing against selectedFeature will invalidate the memoized calback constantly which re-renders the layer component
      if (selectedFeatureId !== id) {
        setSelectedFeature({
          datasetId,
          id,
        });
      }
    },
    [setSelectedFeature, selectedFeatureId]
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
  setFeaturesLoading: any;
}) {
  const map = useMapInstance();
  const abortSignal = useRef<CancelTokenSource>();

  const fetchCallback = useCallback(
    async (payload = {}) => {
      setFeaturesLoading(true);

      abortSignal.current?.cancel();

      const tokenSource = axios.CancelToken.source();
      abortSignal.current = tokenSource;

      let response: AxiosResponse<
        ApiResponse<{
          features: DatasetFeatures;
          errorResults: Array<ApiErrorResponse<null>>;
        }>
      > | null = null;

      try {
        response = await axios({
          url: BFFApiUrls.MAP_DATASETS,
          data: payload,
          method: 'POST',
          cancelToken: tokenSource.token,
        });
      } catch (error) {
        if (!axios.isCancel(error)) {
          setErrorResults([
            {
              ...apiErrorResult(
                'Kaartgegevens konden niet worden geladen',
                null
              ),
              id: 'Alle datasets',
            },
          ]);
        }
      }

      const features = response?.data.content?.features;
      const errorResults = response?.data.content?.errorResults;

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
      }

      setFeaturesLoading(false);
    },
    [
      setPolyLineFeatures,
      setClusterFeatures,
      setErrorResults,
      setFeaturesLoading,
    ]
  );

  const fetch = useDebouncedCallback(fetchCallback, 20).callback;

  const fetchFeatures = useCallback(
    (datasetIds: DatasetId[], filters: DatasetFilterSelection) => {
      if (!map) {
        return;
      }
      const bounds = map.getBounds();

      return fetch({
        datasetIds,
        filters,
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

export function filterActiveDatasets(
  controlItem: DatasetCategoryItem,
  activeDatasetIds: DatasetId[]
): DatasetId[] {
  return controlItem.collection
    .filter((controlItem) => activeDatasetIds.includes(controlItem.id))
    .map((controlItem) => controlItem.id);
}

function toggleCategory(
  activeDatasetIds: string[],
  controlItem: DatasetCategoryItem
) {
  const total = controlItem.collection.length;
  const threshold = Math.round(total / 2);
  const activeItemsTotal = filterActiveDatasets(controlItem, activeDatasetIds)
    .length;

  const isActive =
    (activeItemsTotal !== 0 &&
      activeItemsTotal !== total &&
      activeItemsTotal >= threshold) ||
    activeItemsTotal === 0;

  if (!isActive) {
    return activeDatasetIds.filter((id) => {
      const isDatasetIdInControlItem = controlItem.collection.some(
        (controlItem) => controlItem.id === id
      );
      return !isDatasetIdInControlItem;
    });
  }
  return [...activeDatasetIds, ...controlItem.collection.map(({ id }) => id)];
}

export function useControlItemChange() {
  const [activeDatasetIds, setActiveDatasetIds] = useActiveDatasetIds();

  return useCallback(
    (controlItem: DatasetControlItem | DatasetCategoryItem) => {
      let datasetIds = activeDatasetIds;
      switch (controlItem.type) {
        case 'category':
          datasetIds = toggleCategory(activeDatasetIds, controlItem);
          setActiveDatasetIds(datasetIds);
          break;
        case 'dataset':
          datasetIds = activeDatasetIds.includes(controlItem.id)
            ? activeDatasetIds.filter((id) => id !== controlItem.id)
            : [...activeDatasetIds, controlItem.id];
          setActiveDatasetIds(datasetIds);
          break;
      }
    },
    [activeDatasetIds, setActiveDatasetIds]
  );
}

export function useFilterControlItemChange() {
  const [activeFilters, setActiveFilters] = useActiveDatasetFilters();

  return useCallback(
    (
      datasetId: DatasetId,
      propertyName: DatasetPropertyName,
      propertyValue: DatasetPropertyValue
    ) => {
      const { isChecked } = filterItemCheckboxState(
        activeFilters,
        datasetId,
        propertyName,
        propertyValue
      );

      let activeFiltersUpdate = { ...activeFilters };

      if (!isChecked && !activeFiltersUpdate[datasetId]) {
        activeFiltersUpdate[datasetId] = {
          [propertyName]: [propertyValue],
        };
      }

      let filterValues = activeFiltersUpdate[datasetId][propertyName];

      if (isChecked) {
        filterValues = activeFiltersUpdate[datasetId][propertyName].filter(
          (value) => value !== propertyValue
        );
      } else {
        filterValues = [...filterValues, propertyValue];
      }

      activeFiltersUpdate[datasetId] = {
        ...activeFiltersUpdate[datasetId],
        [propertyName]: filterValues,
      };

      setActiveFilters(activeFiltersUpdate);
    },
    [activeFilters, setActiveFilters]
  );
}
