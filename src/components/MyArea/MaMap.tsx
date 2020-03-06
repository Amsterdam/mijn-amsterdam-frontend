import React, { PropsWithChildren, useState } from 'react';
import {
  Centroid,
  DEFAULT_MAP_OPTIONS,
  DEFAULT_TILE_LAYER_CONFIG,
} from 'config/Map.constants';
import { Map, TileLayer } from '@datapunt/react-maps';
import { DEFAULT_ZOOM } from 'config/Map.constants';
import { toLatLng } from 'helpers/geo';

import 'styles/map.scss';
import classnames from 'classnames';
import styles from './MaMap.module.scss';

type MapDisplayComponentProps = PropsWithChildren<{
  center: Centroid;
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
  const [zzoom, setZoom] = useState(zoom);
  const classes = classnames('map-zoom--' + zzoom);
  return (
    <div className={classes} style={{ height: '100%' }}>
      <Map
        id={id}
        aria-label={title}
        style={{ width: '100%', height: '100%' }}
        events={{
          zoomend: (e: any) => {
            setZoom(e.target._zoom);
          },
        }}
        options={{
          ...DEFAULT_MAP_OPTIONS,
          zoom,
          center: toLatLng(center),
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
    </div>
  );
}
