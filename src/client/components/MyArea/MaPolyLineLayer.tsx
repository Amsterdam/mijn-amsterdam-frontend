import themeColors from '@amsterdam/asc-ui/es/theme/default/colors';
import { useMapInstance } from '@amsterdam/react-maps';
import L, { LeafletMouseEventHandlerFn } from 'leaflet';
import { useEffect, useMemo } from 'react';
import { MaPolyLineFeature } from '../../../server/services/buurt/datasets';
import { getIconHtml } from './datasets';

interface MaPolyLineLayerProps {
  onMarkerClick?: LeafletMouseEventHandlerFn;
  polylineOptions?: L.PolylineOptions;
  datasetId: string;
  features: MaPolyLineFeature[];
}

const DEFAULT_POLYLINE_COLOR = '#EC0000';

export const DEFAULT_POLYLINE_OPTIONS = {
  weight: 1,
  fill: true,
  fillOpacity: 0.4,
  stroke: true,
  color: DEFAULT_POLYLINE_COLOR,
};
const allColors: any = Object.entries(themeColors)
  .filter(([key]) => !['tint', 'bright'].includes(key))
  .map(([, colors]) => Object.values(colors))
  .flatMap((colors) => colors);

export function randomColor() {
  const color =
    allColors[
      Math.min(
        Math.round(Math.random() * allColors.length),
        allColors.length - 1
      )
    ];
  return color;
}

export function MaPolyLineLayer({
  onMarkerClick,
  polylineOptions = DEFAULT_POLYLINE_OPTIONS,
  datasetId,
  features,
}: MaPolyLineLayerProps) {
  const map = useMapInstance();

  useEffect(() => {
    if (!map) {
      return;
    }

    const layers: L.Layer[] = [];

    for (const feature of features) {
      console.log(feature.properties.datasetId);
      const options = {
        ...polylineOptions,
        color: feature.properties.color || 'red',
      };
      const layer = L.polygon(
        feature.geometry.coordinates as
          | L.LatLngExpression[]
          | L.LatLngExpression[][]
          | L.LatLngExpression[][][],
        options
      ).addTo(map);

      layer.feature = feature;

      // const html = getIconHtml(datasetId);
      // const icon = L.divIcon({
      //   html,
      //   className: '',
      //   iconSize: [14, 14],
      //   iconAnchor: [7, 7],
      // });
      // // L.marker(layer.getCenter(), {
      // //   icon,
      // // })
      // //   .bindTooltip(feature.title, {
      // //     className: 'ma-marker-tooltip',
      // //   })
      // //   .addTo(group);
      onMarkerClick && layer.on('click', onMarkerClick);

      layers.push(layer);
    }

    return () => {
      console.log('remove!');
      for (const layer of layers) {
        layer.off('click', onMarkerClick).removeFrom(map);
      }
    };
  }, [map, features, onMarkerClick, polylineOptions, datasetId]);

  return null;
}
