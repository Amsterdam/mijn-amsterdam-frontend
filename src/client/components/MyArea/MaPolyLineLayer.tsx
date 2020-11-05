import { useMapInstance } from '@amsterdam/react-maps';
import L, { LeafletMouseEventHandlerFn } from 'leaflet';
import { useEffect, useMemo } from 'react';
import { MaPolyLineFeature } from '../../../server/services/buurt/datasets';

const DEFAULT_POLYLINE_COLOR = '#EC0000';

export const DEFAULT_POLYLINE_OPTIONS = {
  weight: 1,
  fill: true,
  fillOpacity: 0.4,
  stroke: true,
  color: DEFAULT_POLYLINE_COLOR,
  noClip: true,
};

interface MaPolyLineLayerProps {
  onMarkerClick?: LeafletMouseEventHandlerFn;
  polylineOptions?: L.PolylineOptions;
  features: MaPolyLineFeature[];
}

export function MaPolyLineLayer({
  onMarkerClick,
  polylineOptions = DEFAULT_POLYLINE_OPTIONS,
  features,
}: MaPolyLineLayerProps) {
  const map = useMapInstance();

  // Create custom panes so we can control the zIndex of various polyline shapes
  useEffect(() => {
    for (const feature of features) {
      const paneId = feature.properties.datasetId;
      const zIndex = feature.properties.zIndex;
      if (!map.getPane(paneId)) {
        map.createPane(paneId);
        const pane = map.getPane(paneId);
        if (pane && zIndex) {
          pane.style.zIndex = zIndex;
        }
      }
    }
  }, [features, map]);

  const layers = useMemo(() => {
    const layers: L.Layer[] = [];

    for (const feature of features) {
      const options: L.PolylineOptions = {
        ...polylineOptions,
        color: feature.properties.color || polylineOptions.color,
        pane: feature.properties.datasetId,
      };

      // Add fillOpacity for these shapes so they are easily clickable
      if (feature.geometry.type === 'MultiLineString') {
        options.fillOpacity = 0;
        options.weight = 2;
      }

      const layer = L.polyline(feature.geometry.coordinates as any, options);
      (layer as any).feature = feature;
      layers.push(layer);
    }
    return layers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [features]);

  useEffect(() => {
    if (!layers.length) {
      return;
    }

    const layerGroup = L.featureGroup(layers);

    if (onMarkerClick) {
      layerGroup.on('click', onMarkerClick);
    }

    layerGroup.addTo(map);

    return () => {
      if (onMarkerClick) {
        layerGroup.off('click', onMarkerClick);
      }
      layerGroup.removeFrom(map);
    };
  }, [layers, map, onMarkerClick]);

  return null;
}
