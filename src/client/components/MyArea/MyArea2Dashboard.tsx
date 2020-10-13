import { BaseLayer, Map } from '@amsterdam/arm-core';
import { ThemeProvider } from '@amsterdam/asc-ui';
import 'leaflet/dist/leaflet.css';
import React from 'react';
import styled from 'styled-components';
import { ChapterTitles } from '../../../universal/config';
import { HOOD_ZOOM } from '../../../universal/config/map';
import { getFullAddress } from '../../../universal/helpers/brp';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import { HomeIconMarker } from './MaMarker';
import MyAreaLoader from './MyAreaLoader';

const DasboardMap = styled(Map)`
  position: absolute;
`;

export default function MyArea2Dashboard() {
  const { HOME } = useAppStateGetter();
  const termReplace = useTermReplacement();
  const center = HOME.content?.latlng;
  return (
    <ThemeProvider>
      {!!center ? (
        <DasboardMap
          fullScreen={true}
          aria-label={`Kaart van ${termReplace(
            ChapterTitles.BUURT
          ).toLowerCase()}`}
          options={{
            ...DEFAULT_MAP_OPTIONS,
            zoom: HOOD_ZOOM,
            center,
          }}
        >
          <BaseLayer />
          <HomeIconMarker
            address={
              HOME.content?.address
                ? getFullAddress(HOME.content.address, true)
                : ''
            }
            center={center}
            zoom={HOOD_ZOOM}
          />
        </DasboardMap>
      ) : (
        <MyAreaLoader />
      )}
    </ThemeProvider>
  );
}
