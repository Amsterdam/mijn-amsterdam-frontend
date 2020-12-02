import { useMapInstance } from '@amsterdam/react-maps';
import React, { useCallback, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce/lib';
import {
  MaPointFeature,
  MaPolylineFeature,
} from '../../../server/services/buurt/datasets';
import { ACTIVE_DATASET_IDS_INITIAL } from '../../../universal/config';
import {
  DatasetFilterSelection,
  DatasetId,
} from '../../../universal/config/buurt';
import ErrorMessages from '../ErrorMessages/ErrorMessages';
import {
  useActiveDatasetFilters,
  useActiveDatasetIds,
  useDatasetFilterSelection,
  useFetchFeatures,
  useOnMarkerClick,
  useSelectedFeatureCSS,
} from './MyArea.hooks';
import styles from './MyAreaDatasets.module.scss';
import { MyAreaPolylineDatasets } from './MyAreaPolylineDatasets';
import { MaSuperClusterLayer } from './MyAreaSuperCluster';

interface MyAreaDatasetsProps {
  datasetIds?: string[];
}

export function MyAreaDatasets({ datasetIds }: MyAreaDatasetsProps) {
  const map = useMapInstance();
  const [polylineFeatures, setPolylineFeatures] = useState<MaPolylineFeature[]>(
    []
  );
  const [clusterFeatures, setClusterFeatures] = useState<MaPointFeature[]>([]);
  const [, setFilterSelection] = useDatasetFilterSelection();

  const [errorResults, setErrorResults] = useState<
    Array<{ id: string; message: string }>
  >([]);

  const [isFeaturesLoading, setFeaturesLoading] = useState(
    !clusterFeatures.length && !polylineFeatures.length
  );

  const setFeaturesLoadingDebounced = useDebouncedCallback(
    setFeaturesLoading,
    600
  ).callback;

  const fetchFeatures = useFetchFeatures();

  const [activeDatasetIds, setActiveDatasetIds] = useActiveDatasetIds();
  const [activeFilters] = useActiveDatasetFilters();

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

  const fetchDebounced = useDebouncedCallback(fetch, 50);

  // This callback runs whenever the map zooms / pans
  const onUpdate = useCallback(() => {
    setFeaturesLoadingDebounced(true);
    fetchDebounced.callback(activeDatasetIds, activeFilters);
  }, [
    fetchDebounced,
    setFeaturesLoadingDebounced,
    activeDatasetIds,
    activeFilters,
  ]);

  // Effect fetches everytime datasets are de/activated or filter selection is changed.
  useEffect(() => {
    if (activeDatasetIds.length) {
      setFeaturesLoadingDebounced(true);
      fetchDebounced.callback(activeDatasetIds, activeFilters);
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

  // Set the initially active datasets
  useEffect(() => {
    setActiveDatasetIds(datasetIds ? datasetIds : ACTIVE_DATASET_IDS_INITIAL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        onUpdate={onUpdate}
        onMarkerClick={onMarkerClick}
      />
      {/* <MyAreaClusterDatasets onMarkerClick={onMarkerClick} /> */}
    </>
  );
}
