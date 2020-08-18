import React from 'react';
import { BaseLayer, Map } from '@datapunt/arm-core';
import { LOCATION_ZOOM, HOOD_ZOOM } from '../../../universal/config/map';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import { HomeIconMarker } from './MaMarker';
import MyAreaLoader from './MyAreaLoader';
import styled from 'styled-components';
import { ThemeProvider } from '@datapunt/asc-ui';
import { useAppStateGetter } from '../../hooks/useAppState';
import 'leaflet/dist/leaflet.css';

const DasboardMap = styled(Map)`
  position: absolute;
`;

export default function MyArea2Dashboard() {
  const { HOME } = useAppStateGetter();
  const center = HOME.content?.latlng;
  return (
    <ThemeProvider>
      {!!center ? (
        <DasboardMap
          fullScreen={true}
          aria-label="Kaart van mijn buurt"
          options={{
            ...DEFAULT_MAP_OPTIONS,
            zoom: HOOD_ZOOM,
            center,
          }}
        >
          <BaseLayer />
          <HomeIconMarker center={center} zoom={LOCATION_ZOOM} />
        </DasboardMap>
      ) : (
        <MyAreaLoader />
      )}
    </ThemeProvider>
  );
}
