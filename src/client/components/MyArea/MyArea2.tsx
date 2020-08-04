import {
  BaseLayerToggle,
  MapPanelProvider,
  ViewerContainer,
  Zoom,
} from '@datapunt/arm-core';
import { SnapPoint } from '@datapunt/arm-core/es/components/MapPanel/constants';
import React from 'react';
import styled from 'styled-components';
import {
  DEFAULT_MAP_DISPLAY_CONFIG,
  MapDisplayOptions,
} from '../../config/map';
import { useDesktopScreen } from '../../hooks';
import { MaMap } from './MaMap';
import { HomeIconMarker } from './MaMarker';
import MyAreaLoader from './MyAreaLoader';
import MyAreaPanels from './MyAreaPanels';

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
  const isDesktop = useDesktopScreen();

  return !!center ? (
    <MaMap title={title} zoom={options.zoom} center={center}>
      <HomeIconMarker center={center} zoom={options.zoom} />
      <StyledViewerContainer
        bottomRight={<Zoom />}
        bottomLeft={<BaseLayerToggle />}
      />
      <MapPanelProvider
        variant={isDesktop ? 'panel' : 'drawer'}
        initialPosition={SnapPoint.Closed}
      >
        <MyAreaPanels />
      </MapPanelProvider>
    </MaMap>
  ) : (
    <MyAreaLoader />
  );
}
