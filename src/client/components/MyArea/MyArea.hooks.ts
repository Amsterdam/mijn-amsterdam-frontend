import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useMapInstance } from '@amsterdam/react-maps';
import { LatLngBoundsLiteral, LatLngLiteral, LeafletEvent } from 'leaflet';
import { useLocation } from 'react-router';
import { create } from 'zustand';

import { filterItemCheckboxState } from './LegendPanel/checkbox-helpers';
import styles from './MyAreaDatasets.module.scss';
import type { BAGData } from '../../../server/services/bag/bag.types';
import type {
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
  HOOD_ZOOM,
} from '../../../universal/config/myarea-datasets';
import { LatLngWithAddress } from '../../../universal/helpers/bag';
import { getFullAddress } from '../../../universal/helpers/brp';
import { BFFApiUrls } from '../../config/api';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import { captureMessage } from '../../helpers/monitoring';
import {
  isAborted,
  sendGetRequest,
  sendJSONPostRequest,
} from '../../hooks/api/useBffApi';
import {
  useAppStateGetter,
  useAppStateReady,
} from '../../hooks/useAppStateStore';

const NO_DATA_ERROR_RESPONSE = {
  errors: [
    {
      message: 'Kaartgegevens konden niet worden geladen',
      id: 'De extra informatie die wij normaal op de kaart tonen, bijvoorbeeld over afval en vergunningen',
    },
  ],
};

function getActiveDatasetIdsDefaultValue() {
  const queryConfig = getQueryConfig(window.location.search);
  const defaultValue = queryConfig?.datasetIds?.length
    ? queryConfig.datasetIds
    : ACTIVE_DATASET_IDS_INITIAL;
  return defaultValue;
}

type ActiveDatasetIdsStore = {
  activeDatasetIds: DatasetId[];
  setActiveDatasetIds: (ids: DatasetId[]) => void;
  add: (id: DatasetId) => void;
  remove: (id: DatasetId) => void;
  reset: () => void;
};

export const useActiveDatasetIds = create<ActiveDatasetIdsStore>((set) => ({
  activeDatasetIds: getActiveDatasetIdsDefaultValue(),
  setActiveDatasetIds: (ids: DatasetId[]) => set({ activeDatasetIds: ids }),
  add: (id: DatasetId) =>
    set((state) => ({
      activeDatasetIds: [...state.activeDatasetIds, id],
    })),
  remove: (id: DatasetId) =>
    set((state) => ({
      activeDatasetIds: state.activeDatasetIds.filter((i) => i !== id),
    })),
  reset: () => set({ activeDatasetIds: [] }),
}));

function getActiveDatasetFiltersDefaultValue() {
  const queryConfig = getQueryConfig(window.location.search);
  return queryConfig?.filters || {};
}

type ActiveDatasetFiltersStore = {
  activeDatasetFilters: DatasetFilterSelection;
  setActiveFilters: (
    updater:
      | DatasetFilterSelection
      | ((state: DatasetFilterSelection) => DatasetFilterSelection)
  ) => void;
};

export const useActiveDatasetFilters = create<ActiveDatasetFiltersStore>(
  (set) => ({
    activeDatasetFilters: getActiveDatasetFiltersDefaultValue(),
    setActiveFilters: (
      updater:
        | DatasetFilterSelection
        | ((state: DatasetFilterSelection) => DatasetFilterSelection)
    ) =>
      set((state) => ({
        activeDatasetFilters:
          typeof updater === 'function'
            ? updater(state.activeDatasetFilters)
            : updater,
      })),
  })
);

type DatasetFilterSelectionStore = {
  filterSelection: DatasetFilterSelection;
  setFilterSelection: (selection: DatasetFilterSelection) => void;
};

export const useDatasetFilterSelection = create<DatasetFilterSelectionStore>(
  (set) => ({
    filterSelection: {},
    setFilterSelection: (filterSelection) => set({ filterSelection }),
  })
);

function getLoadingFeatureDefaultValue() {
  const queryConfig = getQueryConfig(window.location.search);
  const defaultValue = queryConfig?.loadingFeature
    ? queryConfig?.loadingFeature
    : null;
  return defaultValue;
}

interface LoadingFeature {
  datasetId?: string;
  id?: string;
  isError?: boolean;
}
type LoadingFeatureStore = {
  loadingFeature: LoadingFeature | null;
  setLoadingFeature: (feature: LoadingFeature | null) => void;
};

export const useLoadingFeature = create<LoadingFeatureStore>((set) => ({
  loadingFeature: getLoadingFeatureDefaultValue(),
  setLoadingFeature: (feature) => set({ loadingFeature: feature }),
}));

type SelectedFeature = { id: string; datasetId: string; [string: string]: any };
type SelectedFeatureStore = {
  selectedFeature: SelectedFeature | null;
  setSelectedFeature: (feature: SelectedFeature | null) => void;
};

export const useSelectedFeature = create<SelectedFeatureStore>((set) => ({
  selectedFeature: null,
  setSelectedFeature: (feature) => set({ selectedFeature: feature }),
}));

export function useSetSelectedFeature() {
  return useSelectedFeature((state) => state.setSelectedFeature);
}

export function useFetchPanelFeature() {
  const setSelectedFeature = useSetSelectedFeature();
  const { loadingFeature, setLoadingFeature } = useLoadingFeature();

  useEffect(() => {
    if (!loadingFeature?.datasetId || !loadingFeature?.id) {
      return;
    }

    const source = new AbortController();
    const { datasetId, id } = loadingFeature;

    sendGetRequest<SelectedFeature>(
      `${BFFApiUrls.MAP_DATASETS}/${datasetId}/${id}`,
      {
        signal: source.signal,
      }
    )
      .then(({ content: feature }) => {
        if (feature) {
          // Add datasetid to the feature data, used for referencing to other states.
          setSelectedFeature({ ...feature, id: String(feature.id), datasetId });
        }
      })
      .catch((error) => {
        if (!isAborted(error)) {
          setLoadingFeature({ isError: true });
        }
      });

    return () => {
      source.abort();
    };
  }, [loadingFeature, setSelectedFeature, setLoadingFeature]);
}

const selectedFeatureStyleSelector = styles['Feature--selected'];

export function useSelectedFeatureCSS(
  features: Array<MaSuperClusterFeature | MaPolylineFeature>
) {
  const { loadingFeature } = useLoadingFeature();
  const map = useMapInstance();
  const loadingFeatureId = loadingFeature?.id;

  useEffect(() => {
    if (map && '_layers' in map && Array.isArray(map._layers)) {
      for (const layer of Object.values(map._layers)) {
        const id = layer?.feature?.properties?.id;
        if (id === loadingFeatureId && layer.getElement) {
          const element = layer.getElement();
          // Add selected class to marker
          document
            ?.querySelector(`.${selectedFeatureStyleSelector}`)
            ?.classList.remove(selectedFeatureStyleSelector);

          element.classList.add(selectedFeatureStyleSelector);
          break;
        }
      }
    }
  }, [map, loadingFeatureId, features]);
}

export function useOnMarkerClick() {
  const { setLoadingFeature } = useLoadingFeature();

  return useCallback((event: LeafletEvent) => {
    const isCluster =
      event?.propagatedFrom?.feature?.properties?.cluster === true;
    if (!isCluster) {
      const id = event?.propagatedFrom?.feature?.properties?.id;
      const datasetId = event?.propagatedFrom?.feature?.properties?.datasetId;

      setLoadingFeature({
        datasetId,
        id,
      });
    }
  }, []);
}

type DatasetResponseContent = {
  clusters?: MaPointFeature[];
  polylines?: MaPolylineFeature[];
  filters?: DatasetFilterSelection;
  errors: Array<{ id: string; message: string }>;
};

export function useFetchFeatures() {
  const abortSignal = useRef<AbortController>();
  const map = useMapInstance();
  return useCallback(
    async (
      datasetIds: DatasetId[],
      filters: DatasetFilterSelection | null
    ): Promise<DatasetResponseContent | null> => {
      // Cancel all previous requests, the latest request will represent latest state
      abortSignal.current?.abort();
      const tokenSource = new AbortController();
      abortSignal.current = tokenSource;

      const mapBounds = map.getBounds();
      const bbox: [number, number, number, number] = [
        mapBounds.getWest(),
        mapBounds.getSouth(),
        mapBounds.getEast(),
        mapBounds.getNorth(),
      ];
      const zoom = map.getZoom();
      const payload = {
        datasetIds,
        filters,
        bbox,
        zoom,
      } as const;

      try {
        const response = await sendJSONPostRequest<DatasetResponseContent>(
          BFFApiUrls.MAP_DATASETS,
          payload,
          {
            signal: tokenSource.signal,
          }
        );
        return response.content;
      } catch (error) {
        if (!isAborted(error)) {
          return NO_DATA_ERROR_RESPONSE;
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
  const activeItemsTotal = filterActiveDatasets(
    datasetIds,
    activeDatasetIds
  ).length;

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
  const { activeDatasetIds, setActiveDatasetIds } = useActiveDatasetIds();
  const { setActiveFilters } = useActiveDatasetFilters();

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
  const { activeDatasetFilters, setActiveFilters } = useActiveDatasetFilters();

  return useCallback(
    (
      datasetId: DatasetId,
      propertyName: DatasetPropertyName,
      propertyValue: DatasetPropertyValue
    ) => {
      const { isChecked } = filterItemCheckboxState(
        activeDatasetFilters,
        datasetId,
        propertyName,
        propertyValue
      );

      const activeFiltersUpdate = { ...activeDatasetFilters };

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
      };
      if (Object.keys(filterValues).length) {
        activeFiltersUpdate[datasetId][propertyName] = { values: filterValues };
      } else if (propertyName in activeFiltersUpdate[datasetId]) {
        delete activeFiltersUpdate[datasetId][propertyName];
      }
      if (!Object.keys(activeFiltersUpdate[datasetId]).length) {
        delete activeFiltersUpdate[datasetId];
      }
      setActiveFilters(activeFiltersUpdate);
    },
    [activeDatasetFilters, setActiveFilters]
  );
}

export interface QueryConfig {
  datasetIds?: DatasetId[];
  filters?: DatasetFilterSelection;
  zoom?: number;
  center?: LatLngLiteral;
  loadingFeature?: { id: string; datasetId: DatasetId };
  bbox?: LatLngBoundsLiteral;
  s?: '1'; // Indicates the url was constructed on the /buurt page
  centerMarker?: {
    label: string;
    latlng: LatLngLiteral;
  };
}

export function getQueryConfig(searchEntry: string): QueryConfig {
  return Object.fromEntries(
    Array.from(new URLSearchParams(searchEntry).entries())
      .map(([k, v]) => {
        let value = undefined;
        try {
          value = v ? JSON.parse(v) : undefined;
        } catch (error) {
          captureMessage('Could not parse Queryparams', {
            properties: {
              key: k,
              value: v,
            },
          });
        }
        return [k, value];
      })
      .filter(([, v]) => !!v)
  );
}

export interface MapLocationMarker {
  type?: string;
  latlng: LatLngLiteral | LatLngWithAddress;
  label: string;
}

export interface MapLocations {
  mapCenter: LatLngLiteral;
  homeLocationMarker: MapLocationMarker | null;
  customLocationMarker: MapLocationMarker | null;
  secondaryLocationMarkers: MapLocationMarker[];
  mapZoom: number;
}

export function useMapLocations(
  centerMarker?: MapLocationMarker,
  zoom: number = HOOD_ZOOM
) {
  const location = useLocation();

  /**
   * Determine center location. The following options exist:
   * Custom marker
   * 1. default latlng
   * 2. latlng from props.centerMarker
   * 3. latlng from urlConfig.centerMarker
   *
   * Home marker
   * 1. latlng from personal data, controls "home" button.
   *
   * If moving the map, center is updated for url sharing purposes (sharing the mapview at that specific location), latlng for custom and home marker should stay the same.
   */
  // Primary address Location from personal data (BRP / KVK)
  const { MY_LOCATION } = useAppStateGetter();

  // Params passed by query will override all other options
  const urlQueryConfig = useMemo(() => {
    return new URLSearchParams(location?.search);
  }, [location?.search]);

  zoom = parseInt(`${urlQueryConfig.get('zoom') || zoom}`, 10);

  const queryCenterMarker = urlQueryConfig.get('centerMarker');

  const customLocationMarker = useMemo(() => {
    const customLocationMarker: MapLocationMarker =
      !!queryCenterMarker && typeof queryCenterMarker === 'string'
        ? JSON.parse(queryCenterMarker)
        : centerMarker;
    const centerMarkerLabel = customLocationMarker?.label;
    const centerMarkerLatLng = customLocationMarker?.latlng;

    let latlng: LatLngLiteral = DEFAULT_MAP_OPTIONS.center!;
    let label = 'Amsterdam centrum';
    let type = 'default';

    if (centerMarkerLatLng) {
      latlng = centerMarkerLatLng;
    }

    if (centerMarkerLabel) {
      label = centerMarkerLabel;
    }

    if (centerMarkerLabel || centerMarkerLatLng) {
      type = 'custom';
    }

    return {
      latlng,
      label,
      type,
    };
  }, [queryCenterMarker, centerMarker]);

  const { home: homeLocationMarker, secondary: secondaryLocationMarkers } =
    useMemo(() => {
      const locations = (MY_LOCATION.content || []).filter(
        (location: BAGData | null): location is BAGData => !!location
      );
      const [primaryLocation, ...secondaryLocations] = locations;

      let homeLocationMarker: MapLocationMarker | null = null;
      const secondaryLocationMarkers: MapLocationMarker[] = [];
      if (primaryLocation?.latlng && !centerMarker) {
        const latlng = primaryLocation.latlng;
        const label = primaryLocation.address
          ? getFullAddress(primaryLocation.address, true)
          : 'Mijn locatie';
        homeLocationMarker = { latlng, label, type: 'home' };
      }
      if (secondaryLocations?.length) {
        for (const location of secondaryLocations) {
          const latlng = location.latlng;
          const label = location.address
            ? getFullAddress(location.address, true)
            : 'Mijn andere locatie';
          if (latlng) {
            secondaryLocationMarkers.push({ latlng, label, type: 'secondary' });
          }
        }
      }
      return {
        home: homeLocationMarker,
        secondary: secondaryLocationMarkers,
      };
    }, [MY_LOCATION.content, centerMarker]);

  const urlQueryCenter = urlQueryConfig.get('center');
  const centerStateLatLng = useMemo(() => {
    if (urlQueryCenter) {
      return JSON.parse(urlQueryCenter);
    }
  }, [urlQueryCenter]);

  const mapCenter: LatLngLiteral = useMemo(() => {
    let center = customLocationMarker.latlng;

    if (centerStateLatLng) {
      center = centerStateLatLng;
    } else if (customLocationMarker.type === 'custom') {
      center = customLocationMarker.latlng;
    } else if (homeLocationMarker && homeLocationMarker?.latlng) {
      center = homeLocationMarker?.latlng;
    }

    return center;
    // Using memo here because we don't need the options to cause re-renders of the <Map/> component.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mapOptions only need to be determined once; dependencies intentionally omitted to avoid unnecessary re-renders
  }, []);

  return {
    mapCenter,
    homeLocationMarker,
    customLocationMarker,
    secondaryLocationMarkers,
    mapZoom: zoom,
  };
}

export function useSetMapCenterAtLocation(
  mapInstance: L.Map | undefined,
  zoom: number,
  customLocationMarker: MapLocationMarker,
  homeLocationMarker: MapLocationMarker | null
) {
  const location = useLocation();
  const isAppStateReady = useAppStateReady();

  // Don't invoke setView if we have a center query parameter on load. The center param has to be processed first.
  const isReady = !new URLSearchParams(location?.search).get('center');
  const isReadyForSetViewUpdates = useRef(isReady);

  /**
   * If a Map center query param is encountered we have to show the user this location, it reflects the map state at the moment the url was created.
   * Because of the undeterministic nature of the various data that this used by this component the isReadyForSetViewUpdates ref is used. We don't want
   * the component to set the view on another coordinate if the user didn't have the chance to view the map as intended.
   *
   * The following scenario was taken into account:
   * 1. Url with a center param
   * 2. Map is loaded on center param
   * 3. Home location arrives from the server
   * 4. Map is recentered on home location.
   *
   * This is not nice UX therefor we set isReadyForSetViewUpdates after appState is ready and mapInstance exists.
   * */
  useEffect(() => {
    if (mapInstance && isReadyForSetViewUpdates.current === true) {
      let centerMarker: MapLocationMarker = customLocationMarker;
      if (customLocationMarker.type === 'default' && !!homeLocationMarker) {
        centerMarker = homeLocationMarker;
      }
      if (centerMarker.latlng) {
        mapInstance.setView(centerMarker.latlng, zoom);
      }
    }
    // Disable because we don't want to re-center the map everytime the zoom level changes.
    // Whenever centerMarker changes, and a new zoom level was provided at the same time, the effect will also take new zoom into account.
  }, [customLocationMarker, homeLocationMarker, mapInstance]);

  useEffect(() => {
    if (mapInstance && isAppStateReady) {
      isReadyForSetViewUpdates.current = true;
    }
  }, [mapInstance, isAppStateReady]);
}
