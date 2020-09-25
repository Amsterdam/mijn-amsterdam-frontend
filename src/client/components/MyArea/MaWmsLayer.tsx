import themeColors from '@amsterdam/asc-ui/es/theme/default/colors';
import { useMapInstance } from '@amsterdam/react-maps';
import L, { LeafletMouseEventHandlerFn } from 'leaflet';
import React, { useEffect, useState } from 'react';
import { createGlobalStyle } from 'styled-components';
import { proj4RD } from '../../config/map';
import { getIconHtml } from './datasets';

interface MaWMSLayerProps {
  onMarkerClick?: LeafletMouseEventHandlerFn;
  url: string;
  options?: L.WMSOptions;
  polylineOptions?: L.PolylineOptions;
  datasetId: string;
  datasetGroupId: string;
}

export const DEFAULT_WMS_OPTIONS = {
  format: 'image/png',
  transparent: true,
};

export const DEFAULT_POLYLINE_OPTIONS = {
  weight: 1,
  fill: true,
  fillOpacity: 0.4,
  stroke: true,
  color: '#000000',
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

export function MaWMSLayer({
  onMarkerClick,
  url,
  options = DEFAULT_WMS_OPTIONS,
  polylineOptions = DEFAULT_POLYLINE_OPTIONS,
  datasetId,
  datasetGroupId,
}: MaWMSLayerProps) {
  const map = useMapInstance();

  // useEffect(() => {
  //   if (!map) {
  //     return;
  //   }

  //   const layer = L.tileLayer.wms(url, options).addTo(map);

  //   if (onMarkerClick) {
  //     layer.on('click', onMarkerClick);
  //   }

  //   return () => {
  //     if (onMarkerClick) {
  //       layer.off('click', onMarkerClick);
  //     }
  //     map.removeLayer(layer);
  //   };
  // }, [map, options, url, onMarkerClick]);

  const [json, setJson] = useState<any>(null);

  useEffect(() => {
    fetch(
      `${url}service=WFS&request=GetFeature&typeNames=ms:${options.layers}&VERSION=2.0.0&outputFormat=geojson`
    )
      .then((data) => data.json())
      .then((jsonData) => {
        jsonData.features.forEach((feature: any) => {
          feature.geometry.coordinates[0] = feature.geometry.coordinates[0].map(
            (coord: any) => {
              const c = proj4RD.inverse(coord);
              return [c[1], c[0]];
            }
          );
          feature.properties.datasetItemId = feature.properties.ogc_fid;
          feature.properties.datasetId = datasetId;
        });
        setJson(jsonData);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!map || !json) {
      return;
    }

    const layers = json.features.map((feature: any) => {
      const options = {
        ...polylineOptions,
        color: feature.properties.color,
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
        .bindTooltip(feature.properties.gebied_naam, {
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
  }, [map, json, onMarkerClick, polylineOptions, datasetId]);

  return <Styles></Styles>;
}
