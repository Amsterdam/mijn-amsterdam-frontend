import { useMapInstance } from '@amsterdam/react-maps';
import React, { useCallback, useEffect, useState } from 'react';
import {
  MaPointFeature,
  MaPolyLineFeature,
} from '../../../server/services/buurt/datasets';
import { ACTIVE_DATASET_IDS_INITIAL } from '../../../universal/config';
import {
  useActiveDatasetIds,
  useFetchFeatures,
  useOnMarkerClick,
  useSelectedFeatureCSS,
} from './MyArea.hooks';
import { MyAreaPolyLineDatasets } from './MyAreaPolyLineDatasets';
import { MaSuperClusterLayer } from './MyAreaSuperCluster';
import LoadingContent from '../LoadingContent/LoadingContent';
import styles from './MyAreaDatasets.module.scss';

interface MyAreaDatasetsProps {
  datasetIds?: string[];
}

export function MyAreaDatasets({ datasetIds }: MyAreaDatasetsProps) {
  const map = useMapInstance();
  const [polyLineFeatures, setPolyLineFeatures] = useState<MaPolyLineFeature[]>(
    []
  );
  const [clusterFeatures, setClusterFeatures] = useState<MaPointFeature[]>([]);
  const fetchFeatures = useFetchFeatures({
    setPolyLineFeatures,
    setClusterFeatures,
  });
  const [activeDatasetIds, setActiveDatasetIds] = useActiveDatasetIds();

  const onUpdate = useCallback(() => {
    fetchFeatures(activeDatasetIds);
  }, [fetchFeatures, activeDatasetIds]);

  useEffect(() => {
    if (activeDatasetIds.length) {
      fetchFeatures(activeDatasetIds);
    }
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
  console.log(clusterFeatures.length, polyLineFeatures.length);
  return (
    <>
      {!clusterFeatures.length && !polyLineFeatures.length && (
        <div className={styles.FeatureLoader}>
          <span></span>
        </div>
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
