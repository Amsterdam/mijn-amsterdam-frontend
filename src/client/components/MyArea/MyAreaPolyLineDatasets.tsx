import { LeafletMouseEventHandlerFn } from 'leaflet';
import React, { useEffect, useMemo } from 'react';
import { createGlobalStyle } from 'styled-components';
import { MaPolyLineFeature } from '../../../server/services/buurt/datasets';
import { BFFApiUrls } from '../../config/api';
import { PARKEERZONES_POLYLINE_OPTIONS, POLYLINE_DATASETS } from './datasets';
import { MaPolyLineLayer } from './MaPolyLineLayer';
import {
  useActivePolyLineDatasetIds,
  useActivePolyLineFeatures,
} from './MyArea.hooks';

const Styles = createGlobalStyle`
  .ma-marker-tooltip {
    background: none;
    border: 0;
    color: white;
    text-shadow:
    -1px -1px 0 #000,
     0   -1px 0 #000,
     1px -1px 0 #000,
     1px  0   0 #000,
     1px  1px 0 #000,
     0    1px 0 #000,
    -1px  1px 0 #000,
    -1px  0   0 #000;
    font-size: 16px;
    font-weight: 500;
    box-shadow: none;
  }
`;

interface MyAreaPolyLineDatasetsProps {
  onMarkerClick?: LeafletMouseEventHandlerFn;
}

export function MyAreaPolyLineDatasets({
  onMarkerClick,
}: MyAreaPolyLineDatasetsProps) {
  const [features, fetchDatasets] = useActivePolyLineFeatures();
  const activePolyLineDatasetIds = useActivePolyLineDatasetIds();

  useEffect(() => {
    const loadedIds = Array.from(
      new Set(features.map((feature) => feature.properties.datasetId))
    );
    const datasetIdsToLoad = activePolyLineDatasetIds.filter(
      (datasetId) => !loadedIds.includes(datasetId)
    );
    if (datasetIdsToLoad.length) {
      fetchDatasets({
        url: `${BFFApiUrls.MAP_DATASETS}/${datasetIdsToLoad[0]}`,
      });
    }
  }, [features, activePolyLineDatasetIds, fetchDatasets]);

  const polyLineLayerData = useMemo(() => {
    console.log('constructing new');
    const polyLineLayerData: Record<string, MaPolyLineFeature[]> = {};
    for (const feature of features) {
      if (!polyLineLayerData[feature.properties.datasetId]) {
        polyLineLayerData[feature.properties.datasetId] = [];
      }
      polyLineLayerData[feature.properties.datasetId].push(feature);
    }
    return polyLineLayerData;
  }, [features]);

  return (
    <>
      {Object.entries(polyLineLayerData).map(([datasetId, features]) => {
        return (
          <MaPolyLineLayer
            key={datasetId}
            features={features}
            polylineOptions={PARKEERZONES_POLYLINE_OPTIONS[datasetId]}
            datasetId={datasetId}
            onMarkerClick={onMarkerClick}
          />
        );
      })}
      <Styles></Styles>
    </>
  );
}
