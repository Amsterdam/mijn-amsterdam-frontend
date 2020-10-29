import { LeafletMouseEventHandlerFn } from 'leaflet';
import React, { useMemo } from 'react';
import { createGlobalStyle } from 'styled-components';
import {
  DatasetCollection,
  MaPolyLineFeature,
} from '../../../server/services/buurt/datasets';
import { PARKEERZONES_POLYLINE_OPTIONS } from './datasets';
import { MaPolyLineLayer } from './MaPolyLineLayer';

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
  features: MaPolyLineFeature[];
}

export function MyAreaPolyLineDatasets({
  onMarkerClick,
  features,
}: MyAreaPolyLineDatasetsProps) {
  const polyLineLayerData = useMemo(() => {
    const polyLineLayerData: Record<string, MaPolyLineFeature[]> = {};
    for (const feature of features) {
      if (!polyLineLayerData[feature.properties.datasetId]) {
        polyLineLayerData[feature.properties.datasetId] = [];
      }
      polyLineLayerData[feature.properties.datasetId].push(feature);
    }
    return Object.entries(polyLineLayerData);
  }, [features]);

  return (
    <>
      {polyLineLayerData.map(([datasetId, features]) => {
        return (
          <MaPolyLineLayer
            key={datasetId}
            features={features}
            polylineOptions={PARKEERZONES_POLYLINE_OPTIONS[datasetId]}
            onMarkerClick={onMarkerClick}
          />
        );
      })}
      <Styles></Styles>
    </>
  );
}
