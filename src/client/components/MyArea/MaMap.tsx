import React, { PropsWithChildren } from 'react';
import { Map, TileLayer } from '@datapunt/react-maps';

import './MaMap.scss';
import { HOOD_ZOOM } from '../../../universal/config';
import {
  DEFAULT_MAP_OPTIONS,
  DEFAULT_TILE_LAYER_CONFIG,
} from '../../config/map';

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
  zoom = HOOD_ZOOM,
}: MapDisplayComponentProps) {
  return (
    <Map
      id={id}
      aria-label={title}
      style={{ width: '100%', height: '100%' }}
      options={{
        ...DEFAULT_MAP_OPTIONS,
        zoom,
        center,
      }}
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
