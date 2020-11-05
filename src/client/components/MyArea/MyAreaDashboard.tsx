import { BaseLayer, Map } from '@amsterdam/arm-core';
import { Heading, themeColor, ThemeProvider } from '@amsterdam/asc-ui';
import 'leaflet/dist/leaflet.css';
import React, { HTMLProps } from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import {
  AppRoutes,
  ChapterTitles,
  getOtapEnvItem,
} from '../../../universal/config';
import { HOOD_ZOOM } from '../../../universal/config/buurt';
import { getFullAddress } from '../../../universal/helpers/brp';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import { HomeIconMarker } from './MaMarker';
import MyAreaLoader from './MyAreaLoader';

const DasboardMap = styled(Map)`
  position: absolute;
`;

const DashboardMapContainer = styled.div`
  background-color: ${themeColor('tint', 'level2')};
  min-height: 50rem;
  margin-bottom: 10rem;
  position: relative;
`;

const StyledNavLink = styled(NavLink)`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: flex-end;
  text-decoration: none;
  z-index: 401;
`;

const StyledNavLinkContentWrap = styled.div`
  background-color: ${themeColor('tint', 'level1')};
  padding: 2rem 4rem;
  width: 46rem;
  margin-left: calc(50% + 2rem);
`;

export default function MyArea2Dashboard() {
  const { HOME } = useAppStateGetter();
  const termReplace = useTermReplacement();
  const center = HOME.content?.latlng;
  return (
    <DashboardMapContainer>
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
      <StyledNavLink to={AppRoutes.BUURT}>
        <StyledNavLinkContentWrap>
          <Heading>{termReplace(ChapterTitles.BUURT)}</Heading>
          <p>
            Klik voor een overzicht van gemeentelijke informatie rond uw{' '}
            {termReplace('eigen woning')}.
          </p>
        </StyledNavLinkContentWrap>
      </StyledNavLink>
    </DashboardMapContainer>
  );
}
