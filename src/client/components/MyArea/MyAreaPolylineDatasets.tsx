import { LeafletMouseEventHandlerFn } from 'leaflet';
import { useMemo } from 'react';
import { MaPolylineFeature } from '../../../server/services/buurt/datasets';
import { POLYLINE_DATASET_OPTIONS } from './datasets';
import { MaPolylineLayer } from './MyAreaPolylineLayer';

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
            polylineOptions={POLYLINE_DATASET_OPTIONS[datasetId]}
            onMarkerClick={onMarkerClick}
          />
        );
      })}
    </>
  );
}
