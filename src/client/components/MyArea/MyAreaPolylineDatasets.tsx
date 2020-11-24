import { LeafletMouseEventHandlerFn } from 'leaflet';
import React, { useMemo } from 'react';
import { createGlobalStyle } from 'styled-components';
import { MaPolylineFeature } from '../../../server/services/buurt/datasets';
import { PARKEERZONES_POLYLINE_OPTIONS } from './datasets';
import { MaPolylineLayer } from './MyAreaPolylineLayer';

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

interface MyAreaPolylineDatasetsProps {
  onMarkerClick?: LeafletMouseEventHandlerFn;
  features: MaPolylineFeature[];
}

export function MyAreaPolylineDatasets({
  onMarkerClick,
  features,
}: MyAreaPolylineDatasetsProps) {
  const polylineLayerData = useMemo(() => {
    const polylineLayerData: Record<string, MaPolylineFeature[]> = {};
    for (const feature of features) {
      if (!polylineLayerData[feature.properties.datasetId]) {
        polylineLayerData[feature.properties.datasetId] = [];
      }
      polylineLayerData[feature.properties.datasetId].push(feature);
    }
    return Object.entries(polylineLayerData);
  }, [features]);

  return (
    <>
      {polylineLayerData.map(([datasetId, features]) => {
        return (
          <MaPolylineLayer
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
