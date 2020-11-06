import { useMapInstance } from '@amsterdam/react-maps';
import React, { useCallback, useEffect, useState } from 'react';
import {
  MaPointFeature,
  MaPolyLineFeature,
} from '../../../server/services/buurt/datasets';
import {
  useActiveDatasetIds,
  useFetchFeatures,
  useOnMarkerClick,
  useSelectedFeatureCSS,
} from './MyArea.hooks';
import { MyAreaPolyLineDatasets } from './MyAreaPolyLineDatasets';
import { MaSuperClusterLayer } from './MyAreaSuperCluster';

export function MyAreaDatasets() {
  const map = useMapInstance();
  const [polyLineFeatures, setPolyLineFeatures] = useState<MaPolyLineFeature[]>(
    []
  );
  const [clusterFeatures, setClusterFeatures] = useState<MaPointFeature[]>([]);
  const fetchFeatures = useFetchFeatures({
    setPolyLineFeatures,
    setClusterFeatures,
  });
  const activeDatasetIds = useActiveDatasetIds();

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

  const onMarkerClick = useOnMarkerClick();

  // This effect will run after the features have been added to the map
  useSelectedFeatureCSS(polyLineFeatures);
  useSelectedFeatureCSS(clusterFeatures);

  return (
    <>
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
