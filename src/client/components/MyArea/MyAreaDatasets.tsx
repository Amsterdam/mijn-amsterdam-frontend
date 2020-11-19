import { useMapInstance } from '@amsterdam/react-maps';
import React, { useCallback, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce/lib';
import {
  MaPointFeature,
  MaPolyLineFeature,
} from '../../../server/services/buurt/datasets';
import { ACTIVE_DATASET_IDS_INITIAL } from '../../../universal/config';
import { ApiErrorResponse } from '../../../universal/helpers/api';
import ErrorMessages from '../ErrorMessages/ErrorMessages';
import {
  useActiveDatasetIds,
  useFetchFeatures,
  useOnMarkerClick,
  useSelectedFeatureCSS,
} from './MyArea.hooks';
import styles from './MyAreaDatasets.module.scss';
import { MyAreaPolyLineDatasets } from './MyAreaPolyLineDatasets';
import { MaSuperClusterLayer } from './MyAreaSuperCluster';

interface MyAreaDatasetsProps {
  datasetIds?: string[];
}

export function MyAreaDatasets({ datasetIds }: MyAreaDatasetsProps) {
  const map = useMapInstance();
  const [polyLineFeatures, setPolyLineFeatures] = useState<MaPolyLineFeature[]>(
    []
  );
  const [clusterFeatures, setClusterFeatures] = useState<MaPointFeature[]>([]);
  const [errorResults, setErrorResults] = useState<
    Array<ApiErrorResponse<null>>
  >([]);
  const [isFeaturesLoading, setFeaturesLoading] = useState(
    !clusterFeatures.length && !polyLineFeatures.length
  );

  const setFeaturesLoadingDebounced = useDebouncedCallback((isLoading) => {
    setFeaturesLoading(isLoading);
  }, 800);

  const fetchFeatures = useFetchFeatures({
    setPolyLineFeatures,
    setClusterFeatures,
    setErrorResults,
    setFeaturesLoading: setFeaturesLoadingDebounced.callback,
  });

  const [activeDatasetIds, setActiveDatasetIds] = useActiveDatasetIds();

  const onUpdate = useCallback(() => {
    fetchFeatures(activeDatasetIds);
  }, [fetchFeatures, activeDatasetIds]);

  useEffect(() => {
    fetchFeatures(activeDatasetIds);
  }, [activeDatasetIds, fetchFeatures]);

  // Set the zIndex of the markerpane. These markers will
  useEffect(() => {
    const pane = map?.getPane('markerPane');
    if (pane) {
      pane.style.zIndex = '800';
    }
  }, [map]);

  useEffect(() => {
    setActiveDatasetIds(datasetIds ? datasetIds : ACTIVE_DATASET_IDS_INITIAL);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onMarkerClick = useOnMarkerClick();

  // This effect will run after the features have been added to the map
  useSelectedFeatureCSS(polyLineFeatures);
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
      <MyAreaPolyLineDatasets
        features={polyLineFeatures}
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
