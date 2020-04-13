import '../../styles/map.scss';

import { Map, TileLayer } from '@datapunt/react-maps';
import React, { PropsWithChildren } from 'react';
import {
  DEFAULT_MAP_OPTIONS,
  DEFAULT_TILE_LAYER_CONFIG,
} from './MyArea.constants';
import { DEFAULT_ZOOM } from '../../../universal/config';

type MapDisplayComponentProps = PropsWithChildren<{
  center: LatLngObject;
  id: string;
  title: string;
  zoom?: number;
}>;

export function MaMap({
  children,
  id,
  title,
  center,
  zoom = DEFAULT_ZOOM,
}: MapDisplayComponentProps) {
  return (
    <Map
      id={id}
      aria-label={title}
      style={{ width: '100%', height: '100%' }}
      options={{ ...DEFAULT_MAP_OPTIONS, zoom, center }}
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
