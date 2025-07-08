import { useCallback, useEffect, useMemo, useRef } from 'react';

import { useMapInstance } from '@amsterdam/react-maps';
import axios, { CancelTokenSource } from 'axios';
import { LatLngBoundsLiteral, LatLngLiteral, LeafletEvent } from 'leaflet';
import { useLocation } from 'react-router';
import {
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from 'recoil';

import { filterItemCheckboxState } from './LegendPanel/DatasetControlCheckbox.tsx';
import styles from './MyAreaDatasets.module.scss';
import { BAGData } from '../../../server/services';
import type {
  MaPointFeature,
  MaPolylineFeature,
  MaSuperClusterFeature,
} from '../../../server/services/buurt/datasets.ts';
import {
  ACTIVE_DATASET_IDS_INITIAL,
  DatasetFilterSelection,
  DatasetId,
  DatasetPropertyName,
  DatasetPropertyValue,
  HOOD_ZOOM,
} from '../../../universal/config/myarea-datasets.ts';
import { LatLngWithAddress } from '../../../universal/helpers/bag.ts';
import { getFullAddress } from '../../../universal/helpers/brp.ts';
import { BFFApiUrls } from '../../config/api.ts';
import { DEFAULT_MAP_OPTIONS } from '../../config/map.ts';
import { captureMessage } from '../../helpers/monitoring.ts';
import { useAppStateGetter, useAppStateReady } from '../../hooks/useAppState.ts';

const NO_DATA_ERROR_RESPONSE = {
  errors: [
    {
      message: 'Kaartgegevens konden niet worden geladen',
      id: 'De extra informatie die wij normaal op de kaart tonen, bijvoorbeeld over afval en vergunningen',
    },
  ],
};

const activeDatasetIdsDefaultValue = selector({
  key: 'activeDatasetIds/Default',
  get: () => {
    const queryConfig = getQueryConfig(globalThis.location.search);
    const defaultValue = queryConfig?.datasetIds?.length
      ? queryConfig.datasetIds
      : ACTIVE_DATASET_IDS_INITIAL;
    return defaultValue;
  },
});

const activeDatasetIdsAtom = atom<DatasetId[]>({
  key: 'activeDatasetIds',
  default: activeDatasetIdsDefaultValue,
});

export function useActiveDatasetIds() {
  return useRecoilState(activeDatasetIdsAtom);
}

const activeDatasetFiltersDefaultValue = selector({
  key: 'activeDatasetIdsDefaultValue',
  get: () => {
    const queryConfig = getQueryConfig(globalThis.location.search);
    return queryConfig?.filters || {};
  },
});

// The currently active (selected) filter set
const activeDatasetFiltersAtom = atom<DatasetFilterSelection>({
  key: 'activeDatasetFilters',
  default: activeDatasetFiltersDefaultValue,
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

const loadingFeatureDefaultValue = selector({
  key: 'loadingFeature/Default',
  get: () => {
    const queryConfig = getQueryConfig(globalThis.location.search);
    const defaultValue = queryConfig?.loadingFeature
      ? queryConfig?.loadingFeature
      : null;
    return defaultValue;
  },
});

// The state of the feature currently / last indicated to be loaded
export const loadingFeatureAtom = atom<LoadingFeature | null>({
  key: 'loadingFeature',
  default: loadingFeatureDefaultValue,
});

export function useLoadingFeature() {
  return useRecoilState(loadingFeatureAtom);
}

type SelectedFeature = unknown;

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

    const source = axios.CancelToken.source();
    const { datasetId, id } = loadingFeature;

    axios({
      url: `${BFFApiUrls.MAP_DATASETS}/${datasetId}/${id}`,
      cancelToken: source.token,
      withCredentials: true,
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

  useEffect(() => {
    if (map && '_layers' in map && Array.isArray(map._layers)) {
      for (const layer of Object.values(map._layers)) {
        const id = layer?.feature?.properties?.id;
        if (id === loadingFeatureId && layer.getElement) {
          const element = layer.getElement();
          // Add selected class to marker
          document
            ?.querySelector(`.${selectedFeatureSelector}`)
            ?.classList.remove(selectedFeatureSelector);

          element.classList.add(selectedFeatureSelector);
          break;
        }
      }
    }
  }, [map, loadingFeatureId, features]);
}

export function useOnMarkerClick() {
  const [, setLoadingFeature] = useLoadingFeature();

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
  const abortSignal = useRef<CancelTokenSource>();
  const map = useMapInstance();
  return useCallback(
    async (
      datasetIds: DatasetId[],
      filters: DatasetFilterSelection | null
    ): Promise<DatasetResponseContent | null> => {
      // Cancel all previous requests, the latest request will represent latest state
      abortSignal.current?.cancel();
      const tokenSource = axios.CancelToken.source();
      abortSignal.current = tokenSource;

      const mapBounds = map.getBounds();
      const bbox: [number, number, number, number] = [
        mapBounds.getWest(),
        mapBounds.getSouth(),
        mapBounds.getEast(),
        mapBounds.getNorth(),
      ];
      const zoom = map.getZoom();
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
          withCredentials: true,
        });
        return response.data.content;
      } catch (error) {
        if (!axios.isCancel(error)) {
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

      const activeFiltersUpdate = { ...activeFilters };

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
    // Disable hook dependencies, the mapOptions only need to be determined once.
    // Using memo here because we don't need the options to cause re-renders of the <Map/> component.
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
