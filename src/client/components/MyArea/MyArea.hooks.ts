import { BaseLayerType } from '@amsterdam/arm-core/lib/components/BaseLayerToggle';
import { useMapInstance } from '@amsterdam/react-maps';
import axios, { CancelTokenSource } from 'axios';
import { LatLngLiteral, LeafletEvent } from 'leaflet';
import { useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import {
  atom,
  AtomEffect,
  DefaultValue,
  selector,
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from 'recoil';
import {
  MaPointFeature,
  MaPolylineFeature,
  MaSuperClusterFeature,
} from '../../../server/services/buurt/datasets';
import {
  ACTIVE_DATASET_IDS_INITIAL,
  DatasetFilterSelection,
  DatasetId,
  DatasetPropertyName,
  DatasetPropertyValue,
  MY_AREA_TRACKING_CATEGORY,
} from '../../../universal/config/buurt';
import { capitalizeFirstLetter } from '../../../universal/helpers';
import { BFFApiUrls } from '../../config/api';
import { trackEventWithProfileType } from '../../hooks';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { filterItemCheckboxState } from './LegendPanel/DatasetControlCheckbox';
import styles from './MyAreaDatasets.module.scss';

const NO_DATA_ERROR_RESPONSE = {
  errors: [
    {
      message: 'Kaartgegevens konden niet worden geladen',
      id:
        'De extra informatie die wij normaal op de kaart tonen, bijvoorbeeld over afval en vergunningen',
    },
  ],
};

const activeDatasetIdsDefaultValue = selector({
  key: 'activeDatasetIds/Default',
  get: () => {
    const queryConfig = getQueryConfig();
    const defaultValue = queryConfig?.datasetIds?.length
      ? queryConfig.datasetIds
      : ACTIVE_DATASET_IDS_INITIAL;
    return defaultValue;
  },
});

const persistOnUnload_UNSTABLE: AtomEffect<any> = ({ onSet, setSelf }) => {
  onSet((state, oldState) => {
    // This will persist the state across page navigation as the default value is set upon unloading of the atom.
    // The atom will not be re-initialized when used again so it appears we can't have 'dynamic' default values. For example a default values derived from URL params.
    if (state instanceof DefaultValue) {
      setSelf(oldState);
    }
  });
};

const activeDatasetIdsAtom = atom<DatasetId[]>({
  key: 'activeDatasetIds',
  default: activeDatasetIdsDefaultValue,
  effects_UNSTABLE: [persistOnUnload_UNSTABLE],
});

export function useActiveDatasetIds() {
  return useRecoilState(activeDatasetIdsAtom);
}

const activeDatasetFiltersDefaultValue = selector({
  key: 'activeDatasetIdsDefaultValue',
  get: () => {
    const queryConfig = getQueryConfig();
    return queryConfig?.filters || {};
  },
});

// The currently active (selected) filter set
const activeDatasetFiltersAtom = atom<DatasetFilterSelection>({
  key: 'activeDatasetFilters',
  default: activeDatasetFiltersDefaultValue,
  effects_UNSTABLE: [persistOnUnload_UNSTABLE],
});

export function useActiveDatasetFilters() {
  return useRecoilState(activeDatasetFiltersAtom);
}

// The complete available filter set from server
const datasetFilterSelectionAtom = atom<DatasetFilterSelection>({
  key: 'datasetFilterSelection',
  default: {},
});

export function useDatasetFilterSelection() {
  return useRecoilState(datasetFilterSelectionAtom);
}

interface LoadingFeature {
  datasetId?: string;
  id?: string;
  isError?: boolean;
}

// The state of the feature currently / last indicated to be loaded
export const loadingFeatureAtom = atom<LoadingFeature | null>({
  key: 'loadingFeature',
  default: null,
});

export function useLoadingFeature() {
  return useRecoilState(loadingFeatureAtom);
}

export function useSetLoadingFeature() {
  return useSetRecoilState(loadingFeatureAtom);
}

type SelectedFeature = any;

// The data of the selected loading feature.
export const selectedFeatureAtom = atom<SelectedFeature>({
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
  const setSelectedFeature = useSetSelectedFeature();
  const [loadingFeature, setLoadingFeature] = useLoadingFeature();

  useEffect(() => {
    if (!loadingFeature?.datasetId || !loadingFeature?.id) {
      return;
    }

    let source = axios.CancelToken.source();
    const { datasetId, id } = loadingFeature;

    axios({
      url: `${BFFApiUrls.MAP_DATASETS}/${datasetId}/${id}`,
      cancelToken: source.token,
    })
      .then(({ data: { content: feature } }) => {
        // Add datasetid to the feature data, used for referencing to other states.
        setSelectedFeature({ ...feature, id: String(feature.id), datasetId });
      })
      .catch((error) => {
        if (!axios.isCancel(error)) {
          setLoadingFeature({ isError: true });
        }
      });

    return () => {
      source.cancel();
    };
  }, [loadingFeature, setSelectedFeature, setLoadingFeature]);
}

const selectedFeatureSelector = styles['Feature--selected'];

export function useSelectedFeatureCSS(
  features: Array<MaSuperClusterFeature | MaPolylineFeature>
) {
  const [loadingFeature] = useLoadingFeature();
  const map = useMapInstance();
  const loadingFeatureId = loadingFeature?.id;

  useLayoutEffect(() => {
    if (map) {
      map.eachLayer((layer: any) => {
        const id = layer?.feature?.properties?.id;
        if (
          id &&
          loadingFeatureId &&
          id === loadingFeatureId &&
          layer.getElement
        ) {
          const element = layer.getElement();
          // Add selected class to marker
          document
            ?.querySelector(`.${selectedFeatureSelector}`)
            ?.classList.remove(selectedFeatureSelector);

          element.classList.add(selectedFeatureSelector);
        }
      });
    }
  }, [map, loadingFeatureId, features]);
}

export function useOnMarkerClick() {
  const [, setLoadingFeature] = useLoadingFeature();
  const profileType = useProfileTypeValue();
  return useCallback(
    (event: LeafletEvent) => {
      const isCluster =
        event?.propagatedFrom?.feature?.properties?.cluster === true;
      if (!isCluster) {
        const id = event?.propagatedFrom?.feature?.properties?.id;
        const datasetId = event?.propagatedFrom?.feature?.properties?.datasetId;

        setLoadingFeature({
          datasetId,
          id,
        });
        trackEventWithProfileType(
          {
            category: MY_AREA_TRACKING_CATEGORY,
            name: `${capitalizeFirstLetter(datasetId)} marker`,
            action: 'Klikken',
          },
          profileType
        );
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
}

type DatasetResponseContent = {
  clusters?: MaPointFeature[];
  polylines?: MaPolylineFeature[];
  filters?: DatasetFilterSelection;
  errors: Array<{ id: string; message: string }>;
};

export function useFetchFeatures() {
  const abortSignal = useRef<CancelTokenSource>();

  return useCallback(
    async (
      datasetIds: DatasetId[],
      filters: DatasetFilterSelection | null,
      zoom: number,
      bbox: [number, number, number, number]
    ): Promise<DatasetResponseContent | null> => {
      // Cancel all previous requests, the latest request will represent latest state
      abortSignal.current?.cancel();

      const tokenSource = axios.CancelToken.source();
      abortSignal.current = tokenSource;

      try {
        const response = await axios({
          url: BFFApiUrls.MAP_DATASETS,
          data: {
            datasetIds,
            filters,
            bbox,
            zoom,
          },
          method: 'POST',
          cancelToken: tokenSource.token,
        });
        return response.data.content;
      } catch (error) {
        if (!axios.isCancel(error)) {
          return NO_DATA_ERROR_RESPONSE;
        }
      }
      return null;
    },
    []
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
  const [, setActiveFilters] = useActiveDatasetFilters();

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

      // Remove the filters of inActive datasets
      setActiveFilters((filters) => {
        if (
          Object.keys(filters).some(
            (datasetId) => !datasetIds.includes(datasetId)
          )
        ) {
          const filtersUpdated = { ...filters };
          for (const datasetId of Object.keys(filters)) {
            if (!datasetIds.includes(datasetId)) {
              delete filtersUpdated[datasetId];
            }
          }
          return filtersUpdated;
        }
        return filters;
      });
    },
    [activeDatasetIds, setActiveDatasetIds, setActiveFilters]
  );
}

const IS_FILTER_ENABLED = 1;

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
          [propertyName]: { values: { [propertyValue]: IS_FILTER_ENABLED } },
        };
      }

      const filterValues = {
        ...((activeFiltersUpdate[datasetId] &&
          activeFiltersUpdate[datasetId][propertyName] &&
          activeFiltersUpdate[datasetId][propertyName].values) ||
          {}),
      };

      if (isChecked) {
        delete filterValues[propertyValue];
      } else {
        filterValues[propertyValue] = IS_FILTER_ENABLED;
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

export function useResetMyAreaState() {
  const resetActiveDatasetIdsAtom = useResetRecoilState(activeDatasetIdsAtom);
  const resetActiveDatasetFiltersAtom = useResetRecoilState(
    activeDatasetFiltersAtom
  );
  const resetDatasetFilterSelectionAtom = useResetRecoilState(
    datasetFilterSelectionAtom
  );
  const resetLoadingFeatureAtom = useResetRecoilState(loadingFeatureAtom);
  const resetSelectedFeatureAtom = useResetRecoilState(selectedFeatureAtom);

  return useCallback(() => {
    resetActiveDatasetIdsAtom();
    resetActiveDatasetFiltersAtom();
    resetDatasetFilterSelectionAtom();
    resetLoadingFeatureAtom();
    resetSelectedFeatureAtom();
  }, [
    resetActiveDatasetIdsAtom,
    resetActiveDatasetFiltersAtom,
    resetDatasetFilterSelectionAtom,
    resetLoadingFeatureAtom,
    resetSelectedFeatureAtom,
  ]);
}

export interface QueryConfig {
  datasetIds?: DatasetId[];
  filters?: DatasetFilterSelection;
  zoom?: number;
  center?: LatLngLiteral;
}

export function getQueryConfig(): QueryConfig {
  return Object.fromEntries(
    Array.from(new URLSearchParams(window.location.search).entries())
      .map(([k, v]) => {
        return [k, v ? JSON.parse(v) : undefined];
      })
      .filter(([, v]) => !!v)
  );
}
