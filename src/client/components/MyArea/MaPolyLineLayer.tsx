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

  const layers = useMemo(() => {
    const layers: L.Layer[] = [];

    for (const feature of features) {
      const options = {
        ...polylineOptions,
        color: feature.properties.color || polylineOptions.color,
      };
      const layer = L.polygon(
        feature.geometry.coordinates as
          | L.LatLngExpression[]
          | L.LatLngExpression[][]
          | L.LatLngExpression[][][],
        options
      );

      layer.feature = feature;

      layers.push(layer);
    }
    return layers;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
