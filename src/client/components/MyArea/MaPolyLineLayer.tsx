import themeColors from '@amsterdam/asc-ui/es/theme/default/colors';
import { useMapInstance } from '@amsterdam/react-maps';
import L, { LeafletMouseEventHandlerFn } from 'leaflet';
import React, { useEffect } from 'react';
import { createGlobalStyle } from 'styled-components';
import { getIconHtml } from './datasets';

interface MaPolyLineLayerProps {
  onMarkerClick?: LeafletMouseEventHandlerFn;
  polylineOptions?: L.PolylineOptions;
  datasetId: string;
  datasetGroupId: string;
  features: MaPolyLineFeature[];
}

export interface MaPolyLineFeature {
  color?: string;
  title: string;
  geometry: any;
  datasetId: string;
  datasetItemId: string;
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

export function MaPolyLineLayer({
  onMarkerClick,
  polylineOptions = DEFAULT_POLYLINE_OPTIONS,
  datasetId,
  datasetGroupId,
  features,
}: MaPolyLineLayerProps) {
  const map = useMapInstance();

  useEffect(() => {
    if (!map) {
      return;
    }

    const layers = features.map((feature: any) => {
      const options = {
        ...polylineOptions,
        color: feature.color,
      };
      const group = L.featureGroup().addTo(map);
      const layer = L.polygon(feature.geometry.coordinates, options).addTo(
        group
      );

      layer.feature = feature;

      const html = getIconHtml(datasetId);
      const icon = L.divIcon({
        html,
        className: '',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });
      L.marker(layer.getCenter(), {
        icon,
      })
        .bindTooltip(feature.title, {
          className: 'ma-marker-tooltip',
        })
        .addTo(group);

      onMarkerClick && group.on('click', onMarkerClick);

      return group;
    });

    return () => {
      layers.forEach((layer: any) => {
        layer.off('click', onMarkerClick);
        map.removeLayer(layer);
      });
    };
  }, [map, features, onMarkerClick, polylineOptions, datasetId]);

  return <Styles></Styles>;
}
