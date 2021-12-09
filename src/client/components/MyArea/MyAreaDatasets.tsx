import { useMapInstance } from '@amsterdam/react-maps';
import { LeafletEvent, Map } from 'leaflet';
import isEqual from 'lodash.isequal';
import { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce/lib';
import type {
  MaPointFeature,
  MaPolylineFeature,
} from '../../../server/services/buurt/datasets';
import { AppRoutes } from '../../../universal/config';
import {
  DatasetFilterSelection,
  DatasetId,
} from '../../../universal/config/buurt';
import ErrorMessages from '../ErrorMessages/ErrorMessages';
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

interface MyAreaDatasetsProps {
  datasetIds?: DatasetId[];
}

export function MyAreaDatasets({ datasetIds }: MyAreaDatasetsProps) {
  const map = useMapInstance();
  const history = useHistory();

  const [polylineFeatures, setPolylineFeatures] = useState<MaPolylineFeature[]>(
    []
  );
  const [clusterFeatures, setClusterFeatures] = useState<MaPointFeature[]>([]);
  const [, setFilterSelection] = useDatasetFilterSelection();
  const [loadingFeature] = useLoadingFeature();

  const [errorResults, setErrorResults] = useState<
    Array<{ id: string; message: string }>
  >([]);

  const [isFeaturesLoading, setFeaturesLoading] = useState(
    !!datasetIds?.length && !clusterFeatures.length && !polylineFeatures.length
  );

  const setFeaturesLoadingDebounced = useDebouncedCallback(
    setFeaturesLoading,
    600
  );

  const search = history.location.search;
  const fetchFeatures = useFetchFeatures();
  const [activeDatasetIdsState, setActiveDatasetIds] = useActiveDatasetIds();
  const [activeFilters, setActiveFilterSelection] = useActiveDatasetFilters();
  const activeDatasetIds = datasetIds || activeDatasetIdsState;

  // Align URL and state. Takes URL as primary source of truth.
  useEffect(() => {
    const queryConfig = getQueryConfig(search);
    const currentZoom = map.getZoom();
    const currentCenter = map.getCenter();

    const zoom = queryConfig?.s
      ? currentZoom
      : queryConfig?.zoom || currentZoom;

    const center = queryConfig?.s
      ? currentCenter
      : queryConfig?.center || currentCenter;

    const datasetIds = queryConfig?.s
      ? activeDatasetIds
      : Array.isArray(queryConfig?.datasetIds)
      ? queryConfig?.datasetIds
      : activeDatasetIds;

    const filters = queryConfig?.s
      ? activeFilters
      : queryConfig?.filters || activeFilters;

    if (!isEqual(datasetIds, activeDatasetIds)) {
      setActiveDatasetIds(datasetIds);
    }

    if (!isEqual(filters, activeFilters)) {
      setActiveFilterSelection(filters);
    }

    if (!isEqual(center, currentCenter) || !isEqual(zoom, currentZoom)) {
      map.setView(center, zoom);
    }

    const loadingFeatureStr =
      loadingFeature && !loadingFeature?.isError
        ? JSON.stringify(loadingFeature)
        : null;

    const datasetIdsStr = datasetIds.length ? JSON.stringify(datasetIds) : '';

    const filtersStr = Object.entries(filters).length
      ? JSON.stringify(filters)
      : '';

    const params = new URLSearchParams(search);
    params.set('zoom', map.getZoom().toString());
    params.set('center', JSON.stringify(map.getCenter()));
    params.set('datasetIds', datasetIdsStr);
    params.set('filters', filtersStr);
    params.set('s', '1');

    const url = `${AppRoutes.BUURT}?${params}`;

    history.replace(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, activeDatasetIds, activeFilters]);

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

  const fetchDebounced = useDebouncedCallback(fetch, 100);

  const reflectMapViewUrl = useCallback(
    (map: Map) => {
      const params = new URLSearchParams(search);
      params.set('zoom', map.getZoom().toString());
      params.set('center', JSON.stringify(map.getCenter()));
      const url = `${AppRoutes.BUURT}?${params}`;
      history.replace(url);
    },
    [search, history]
  );

  // This callback runs whenever the map zooms / pans
  const onUpdate = useCallback(
    (event: LeafletEvent) => {
      console.log('onUpdate', event.target.getZoom());
      setFeaturesLoadingDebounced(true);
      fetchDebounced(activeDatasetIds, activeFilters);
      reflectMapViewUrl(event.target);
    },
    [
      reflectMapViewUrl,
      fetchDebounced,
      setFeaturesLoadingDebounced,
      activeDatasetIds,
      activeFilters,
    ]
  );

  useEffect(() => {
    map.on('moveend', onUpdate);
    return () => {
      map.off('moveend', onUpdate);
    };
  }, [map, onUpdate]);

  // Effect fetches everytime datasets are de/activated or filter selection is changed.
  useEffect(() => {
    if (activeDatasetIds.length) {
      setFeaturesLoadingDebounced(true);
      fetchDebounced(activeDatasetIds, activeFilters);
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
    activeFilters,
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
        <ErrorMessages
          key="DatasetErrorMessages"
          title="U ziet niet alle gegevens die wij willen tonen in Mijn buurt."
          errors={errorResults.map((result) => {
            return {
              stateKey: result?.id || 'BUURT',
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
