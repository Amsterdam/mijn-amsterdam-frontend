import { BaseLayer, Map } from '@datapunt/arm-core';
import React, { PropsWithChildren, useState } from 'react';
import { HOOD_ZOOM } from '../../../universal/config';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import classnames from 'classnames';

import styles from './MaMap.module.scss';
import 'leaflet/dist/leaflet.css';

type MapDisplayComponentProps = PropsWithChildren<{
  center: LatLngObject;
  title: string;
  zoom?: number;
}>;

export function MaMap({
  children,
  title,
  center,
  zoom = HOOD_ZOOM,
}: MapDisplayComponentProps) {
  const [zzoom, setZoom] = useState(zoom);
  const classes = classnames(styles.MapContainer, 'map-zoom--' + zzoom);
  return (
    <div className={classes}>
      <Map
        fullScreen={true}
        aria-label={title}
        events={{
          zoomend: (e: any) => {
            console.log('zzzz');
            setZoom(e.target._zoom);
          },
        }}
        options={{
          ...DEFAULT_MAP_OPTIONS,
          zoom,
          center,
        }}
      >
        <BaseLayer />
        {children}
      </Map>
    </div>
  );
}
