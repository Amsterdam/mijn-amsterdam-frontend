import { useMemo } from 'react';

import type { LeafletMouseEventHandlerFn } from 'leaflet';

import type { MaPolylineFeature } from '../../../server/services/buurt/datasets.ts';
import { MaPolylineLayer } from './MyAreaPolylineLayer.tsx';

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
            onMarkerClick={onMarkerClick}
          />
        );
      })}
    </>
  );
}
