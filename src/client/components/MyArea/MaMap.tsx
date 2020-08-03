import { BaseLayer, Map } from '@datapunt/arm-core';
import React, { PropsWithChildren } from 'react';
import { HOOD_ZOOM } from '../../../universal/config';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';

import './MaMap.scss';

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
  return (
    <Map
      fullScreen={true}
      aria-label={title}
      options={{
        ...DEFAULT_MAP_OPTIONS,
        zoom,
        center,
      }}
    >
      <BaseLayer />
      {children}
    </Map>
  );
}
