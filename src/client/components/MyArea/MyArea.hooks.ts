import { useMapInstance } from '@amsterdam/react-maps';
import axios, { CancelTokenSource } from 'axios';
import { LeafletEvent } from 'leaflet';
import { useCallback, useEffect, useMemo, useRef } from 'react';
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
  MaPolylineFeature,
  MaSuperClusterFeature,
} from '../../../server/services/buurt/datasets';
import {
  DatasetFilterSelection,
  DatasetId,
  DatasetPropertyName,
  DatasetPropertyValue,
} from '../../../universal/config/buurt';
import { BFFApiUrls } from '../../config/api';
import styles from './MyAreaDatasets.module.scss';
import { filterItemCheckboxState } from './MyAreaPanels';

const activeDatasetIdsAtom = atom<string[]>({
  key: 'activeDatasetIds',
  default: [],
});

export function useActiveDatasetIds() {
  return useRecoilState(activeDatasetIdsAtom);
}

// The currently active (selected) filter set
const activeDatasetFiltersAtom = atom<DatasetFilterSelection>({
  key: 'activeDatasetFilters',
  default: {},
});

export function useActiveDatasetFilters() {
  return useRecoilState(activeDatasetFiltersAtom);
}

// The complete available filter set
const datasetFilterSelectionAtom = atom<DatasetFilterSelection>({
  key: 'datasetFilterSelection',
  default: {},
});

export function useDatasetFilterSelection() {
  return useRecoilState(datasetFilterSelectionAtom);
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
  features: Array<MaSuperClusterFeature | MaPolylineFeature>
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

type DatasetResponseContent = {
  clusters?: MaPointFeature[];
  polylines?: MaPolylineFeature[];
  filters?: DatasetFilterSelection;
  errors: Array<{ id: string; message: string }>;
};

export function useFetchFeatures() {
  const map = useMapInstance();
  const abortSignal = useRef<CancelTokenSource>();

  return useCallback(
    async (
      datasetIds: DatasetId[],
      filters: DatasetFilterSelection | null
    ): Promise<DatasetResponseContent | null> => {
      abortSignal.current?.cancel();

      const tokenSource = axios.CancelToken.source();
      abortSignal.current = tokenSource;
      const bounds = map.getBounds();
      try {
        const response = await axios({
          url: BFFApiUrls.MAP_DATASETS,
          data: {
            datasetIds,
            filters,
            bbox: [
              bounds.getWest(),
              bounds.getSouth(),
              bounds.getEast(),
              bounds.getNorth(),
            ],
            zoom: map.getZoom(),
          },
          method: 'POST',
          cancelToken: tokenSource.token,
        });
        return response.data.content;
      } catch (error) {
        if (!axios.isCancel(error)) {
          return {
            errors: [
              {
                message: 'Kaartgegevens konden niet worden geladen',
                id: 'Alle kaartgegevens',
              },
            ],
          };
        }
      }
      return null;
    },
    [map]
  );
}

export function filterActiveDatasets(
  datasetIds: DatasetId[],
  activeDatasetIds: DatasetId[]
): DatasetId[] {
  return datasetIds
    .filter((datasetId) => activeDatasetIds.includes(datasetId))
    .map((datasetId) => datasetId);
}

function toggleCategory(
  datasetIds: DatasetId[],
  activeDatasetIds: DatasetId[]
): DatasetId[] {
  const total = datasetIds.length;
  const threshold = Math.round(total / 2);
  const activeItemsTotal = filterActiveDatasets(datasetIds, activeDatasetIds)
    .length;

  const isActive =
    (activeItemsTotal !== 0 &&
      activeItemsTotal !== total &&
      activeItemsTotal >= threshold) ||
    activeItemsTotal === 0;

  if (!isActive) {
    return activeDatasetIds.filter((activeId) => {
      const isDatasetIdInCategory = datasetIds.some(
        (datasetId) => datasetId === activeId
      );
      return !isDatasetIdInCategory;
    });
  }
  return [...activeDatasetIds, ...datasetIds];
}

export function useControlItemChange() {
  const [activeDatasetIds, setActiveDatasetIds] = useActiveDatasetIds();

  return useCallback(
    (type: 'category' | 'dataset', ids: string[]) => {
      let datasetIds = activeDatasetIds;
      switch (type) {
        case 'category':
          datasetIds = toggleCategory(ids, activeDatasetIds);
          break;
        case 'dataset':
          datasetIds = activeDatasetIds.some((id) => ids.includes(id))
            ? activeDatasetIds.filter((id) => !ids.includes(id))
            : [...activeDatasetIds, ...ids];

          break;
      }
      setActiveDatasetIds(datasetIds);
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

      console.log('!!', activeFiltersUpdate);

      if (!isChecked && !activeFiltersUpdate[datasetId]) {
        activeFiltersUpdate[datasetId] = {
          [propertyName]: { values: [propertyValue] },
        };
      }

      let filterValues =
        (activeFiltersUpdate[datasetId] &&
          activeFiltersUpdate[datasetId][propertyName] &&
          activeFiltersUpdate[datasetId][propertyName].values) ||
        [];

      if (isChecked) {
        filterValues = activeFiltersUpdate[datasetId][
          propertyName
        ].values.filter((value) => value !== propertyValue);
      } else {
        filterValues = [...filterValues, propertyValue];
      }

      activeFiltersUpdate[datasetId] = {
        ...activeFiltersUpdate[datasetId],
        [propertyName]: { values: filterValues },
      };

      setActiveFilters(activeFiltersUpdate);
    },
    [activeFilters, setActiveFilters]
  );
}
