import { BaseLayerToggle, ViewerContainer, Zoom } from '@datapunt/arm-core';
import React from 'react';
import styled from 'styled-components';
import {
  DEFAULT_MAP_DISPLAY_CONFIG,
  MapDisplayOptions,
} from '../../config/map';
import { MaMap } from './MaMap';
import { HomeIconMarker } from './MaMarker';
import MyAreaLoader from './MyAreaLoader';

interface MyAreaMapComponentProps {
  title?: string;
  center?: LatLngObject | null;
  homeAddress?: string;
  options?: MapDisplayOptions;
}

const StyledViewerContainer = styled(ViewerContainer)`
  height: 100%;
`;

export default function MyArea2({
  center,
  title = 'Kaart van Mijn buurt',
  homeAddress,
  options = DEFAULT_MAP_DISPLAY_CONFIG,
}: MyAreaMapComponentProps) {
  return !!center ? (
    <MaMap title={title} zoom={options.zoom} center={center}>
      <HomeIconMarker center={center} zoom={options.zoom} />
      <StyledViewerContainer
        bottomRight={<Zoom />}
        bottomLeft={<BaseLayerToggle />}
      />
    </MaMap>
  ) : (
    <MyAreaLoader />
  );
}
