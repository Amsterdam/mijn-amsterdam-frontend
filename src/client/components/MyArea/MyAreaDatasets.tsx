import { useCallback, useEffect, useState } from 'react';

import { useMapInstance } from '@amsterdam/react-maps';
import { LeafletEvent, Map } from 'leaflet';
import isEqual from 'lodash.isequal';
import { useLocation, useNavigate } from 'react-router';
import { useDebouncedCallback } from 'use-debounce';

import { routeConfig, themaId } from './MyArea-thema-config';
import { toBoundLiteral } from './MyArea.helpers';
import {
  getQueryConfig,
  useActiveDatasetFilters,
  useActiveDatasetIds,
  useDatasetFilterSelection,
  useFetchFeatures,
  useLoadingFeature,
  useOnMarkerClick,
  useSelectedFeatureCSS,
} from './MyArea.hooks';
import styles from './MyAreaDatasets.module.scss';
import { MyAreaPolylineDatasets } from './MyAreaPolylineDatasets';
import { MaSuperClusterLayer } from './MyAreaSuperCluster';
import type {
  MaPointFeature,
  MaPolylineFeature,
} from '../../../server/services/buurt/datasets';
import {
  DatasetFilterSelection,
  DatasetId,
} from '../../../universal/config/myarea-datasets';
import { ErrorMessagesContent } from '../ErrorMessages/ErrorMessages';

interface MyAreaDatasetsProps {
  datasetIds?: DatasetId[];
}

export function MyAreaDatasets({ datasetIds }: MyAreaDatasetsProps) {
  const map = useMapInstance();
  const location = useLocation();
  const navigate = useNavigate();
  const [polylineFeatures, setPolylineFeatures] = useState<MaPolylineFeature[]>(
    []
  );
  const [clusterFeatures, setClusterFeatures] = useState<MaPointFeature[]>([]);
  const { setFilterSelection } = useDatasetFilterSelection();
  const { loadingFeature, setLoadingFeature } = useLoadingFeature();

  const [errorResults, setErrorResults] = useState<
    Array<{ id: string; message: string }>
  >([]);

  const [isFeaturesLoading, setFeaturesLoading] = useState(
    !!datasetIds?.length && !clusterFeatures.length && !polylineFeatures.length
  );

  const FEATURES_LOADING_DEBOUNCE_MS = 600;
  const setFeaturesLoadingDebounced = useDebouncedCallback(
    setFeaturesLoading,
    FEATURES_LOADING_DEBOUNCE_MS
  );

  const search = location.search;
  const fetchFeatures = useFetchFeatures();
  const { activeDatasetIds: activeDatasetIds_, setActiveDatasetIds } =
    useActiveDatasetIds();
  const { activeDatasetFilters, setActiveFilters } = useActiveDatasetFilters();
  const activeDatasetIds = datasetIds || activeDatasetIds_;

  // Align URL and state. Takes URL as primary source of truth.
  useEffect(() => {
    const queryConfig = getQueryConfig(search);
    const currentBbox = toBoundLiteral(map.getBounds());

    const bbox = queryConfig?.s
      ? currentBbox
      : queryConfig?.bbox || currentBbox;

    const datasetIds = queryConfig?.s
      ? activeDatasetIds
      : Array.isArray(queryConfig?.datasetIds)
        ? queryConfig?.datasetIds
        : activeDatasetIds;

    const filters = queryConfig?.s
      ? activeDatasetFilters
      : queryConfig?.filters || {};

    const activeFeature = queryConfig?.s
      ? loadingFeature
      : queryConfig?.loadingFeature || null;

    if (!isEqual(datasetIds, activeDatasetIds)) {
      setActiveDatasetIds(datasetIds);
    }

    if (!isEqual(filters, activeDatasetFilters)) {
      setActiveFilters(filters);
    }

    if (!isEqual(activeFeature, loadingFeature)) {
      setLoadingFeature(activeFeature);
    }

    if (!isEqual(bbox, currentBbox)) {
      map.fitBounds(bbox);
    }

    const datasetIdsStr = datasetIds.length ? JSON.stringify(datasetIds) : '';
    const filtersStr = Object.entries(filters).length
      ? JSON.stringify(filters)
      : '';

    const params = new URLSearchParams(search);
    params.set('zoom', map.getZoom().toString());
    params.set('center', JSON.stringify(map.getCenter()));
    params.set('datasetIds', datasetIdsStr);
    params.set('filters', filtersStr);
    params.set('loadingFeature', JSON.stringify(loadingFeature));

    if (queryConfig?.centerMarker) {
      params.set('centerMarker', JSON.stringify(queryConfig.centerMarker));
    }

    if (queryConfig?.bbox) {
      params.set('bbox', JSON.stringify(bbox));
    }

    // Set the s parameter to indicate the url was constructed. s=1 means the atomState instead of the url is leading in setting the map state.
    params.set('s', '1');

    // Quick escape when url is already correct.
    if (`?${params}` === search) {
      return;
    }

    const url = `${routeConfig.themaPage.path}?${params}`;

    navigate(url);
  }, [search, activeDatasetIds, activeDatasetFilters, loadingFeature]);

  const fetch = useCallback(
    async (
      activeDatasetIds: DatasetId[],
      activeFilters: DatasetFilterSelection
    ) => {
      const responseContent = await fetchFeatures(
        activeDatasetIds,
        activeFilters
      );

      if (responseContent) {
        const { errors, polylines, clusters, filters } = responseContent;
        if (clusters) {
          setClusterFeatures(clusters);
        }
        if (polylines) {
          setPolylineFeatures(polylines);
        }
        if (errors) {
          setErrorResults(errors);
        }
        if (filters) {
          setFilterSelection(filters);
        }
      }
      setFeaturesLoadingDebounced(false);
    },
    [fetchFeatures, setFilterSelection, setFeaturesLoadingDebounced]
  );

  const FETCH_DEBOUNCE_MS = 100;
  const fetchDebounced = useDebouncedCallback(fetch, FETCH_DEBOUNCE_MS);

  const reflectMapViewUrl = useCallback(
    (map: Map) => {
      const params = new URLSearchParams(search);

      const currentZoom = map.getZoom().toString();
      const currentCenter = JSON.stringify(map.getCenter());

      if (
        currentZoom !== params.get('zoom') &&
        currentCenter !== params.get('center')
      ) {
        params.set('zoom', currentZoom);
        params.set('center', currentCenter);

        const url = `${routeConfig.themaPage.path}?${params}`;
        navigate(url);
      }
    },
    [search, location.pathname, navigate]
  );

  // This callback runs whenever the map zooms / pans
  const onUpdate = useCallback(
    (event: LeafletEvent) => {
      setFeaturesLoadingDebounced(true);
      fetchDebounced(activeDatasetIds, activeDatasetFilters);
      reflectMapViewUrl(event.target);
    },
    [
      reflectMapViewUrl,
      fetchDebounced,
      setFeaturesLoadingDebounced,
      activeDatasetIds,
      activeDatasetFilters,
    ]
  );

  useEffect(() => {
    map.on('moveend viewreset', onUpdate);

    return () => {
      map.off('moveend', onUpdate);
    };
  }, [map, onUpdate]);

  // Effect fetches everytime datasets are de/activated or filter selection is changed.
  useEffect(() => {
    if (activeDatasetIds.length) {
      setFeaturesLoadingDebounced(true);
      fetchDebounced(activeDatasetIds, activeDatasetFilters);
    } else {
      // Setting the state to empty arrays results in the removal of markers from the map.
      setClusterFeatures([]);
      setPolylineFeatures([]);
      setErrorResults([]);
    }
  }, [
    fetchDebounced,
    setClusterFeatures,
    setPolylineFeatures,
    setErrorResults,
    activeDatasetIds,
    activeDatasetFilters,
    setFeaturesLoadingDebounced,
  ]);

  // Set the zIndex of the markerpane. These markers will be placed above eachother.
  useEffect(() => {
    const pane = map?.getPane('markerPane');
    if (pane) {
      pane.style.zIndex = '800';
    }
  }, [map]);

  const onMarkerClick = useOnMarkerClick();

  // This effect will run after the features have been added to the map
  useSelectedFeatureCSS(polylineFeatures);
  useSelectedFeatureCSS(clusterFeatures);

  return (
    <>
      {isFeaturesLoading && (
        <div className={styles.FeatureLoader}>
          <span>Kaartgegevens laden...</span>
        </div>
      )}
      {!!errorResults.length && (
        <ErrorMessagesContent
          key="DatasetErrorMessages"
          title="Wij kunnen de informatie over de locatie nu niet tonen."
          errors={errorResults.map((result) => {
            return {
              stateKey: result?.id || themaId,
              name: result?.id || 'dataset',
              error: result?.message,
            };
          })}
          className={styles.ErrorMessages}
        />
      )}
      <MyAreaPolylineDatasets
        features={polylineFeatures}
        onMarkerClick={onMarkerClick}
      />
      <MaSuperClusterLayer
        features={clusterFeatures}
        onMarkerClick={onMarkerClick}
      />
    </>
  );
}
