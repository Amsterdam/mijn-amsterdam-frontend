import React, { PropsWithChildren } from 'react';
import {
  Centroid,
  DEFAULT_MAP_OPTIONS,
  DEFAULT_TILE_LAYER_CONFIG,
} from 'config/Map.constants';
import { Map, TileLayer } from '@datapunt/react-maps';
import 'leaflet/dist/leaflet.css';

type MapDisplayComponentProps = PropsWithChildren<{
  center: Centroid;
  id: string;
  title: string;
}>;

export function MaMap({
  children,
  id,
  title,
  center,
}: MapDisplayComponentProps) {
  return (
    <Map
      id={id}
      aria-label={title}
      style={{ width: '100%', height: '100%' }}
      options={{ ...DEFAULT_MAP_OPTIONS, center }}
    >
      <TileLayer
        options={{
          ...DEFAULT_TILE_LAYER_CONFIG.options,
        }}
        args={[DEFAULT_TILE_LAYER_CONFIG.url]}
      />
      {children}
    </Map>
  );
}
