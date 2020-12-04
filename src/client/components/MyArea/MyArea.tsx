import {
  BaseLayerToggle,
  Map,
  ViewerContainer,
  Zoom,
} from '@amsterdam/arm-core';
import {
  AERIAL_AMSTERDAM_LAYERS,
  DEFAULT_AMSTERDAM_LAYERS,
} from '@amsterdam/arm-core/lib/constants';
import { ThemeProvider } from '@amsterdam/asc-ui';
import { useMapInstance } from '@amsterdam/react-maps';
import L, { TileLayerOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { ChapterTitles, HOOD_ZOOM } from '../../../universal/config';
import { DATASETS } from '../../../universal/config/buurt';
import { getFullAddress } from '../../../universal/helpers';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import { useDesktopScreen } from '../../hooks';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import { MyAreaDatasets } from './MyAreaDatasets';
import MyAreaHeader from './MyAreaHeader';
import HomeControlButton from './MyAreaHomeControlButton';
import MyAreaLoadingIndicator from './MyAreaLoadingIndicator';
import { HomeIconMarker } from './MyAreaMarker';
import {
  PanelState,
  DESKTOP_PANEL_WIDTH,
  DESKTOP_PANEL_TOGGLE_BUTTON_WIDTH,
  PREVIEW_PANEL_HEIGHT,
} from './MyAreaPanelComponent';
import MyAreaPanels from './MyAreaPanels';
import { PhonePanelPadding } from './MyAreaPanelComponent';

const StyledViewerContainer = styled(ViewerContainer)<{
  mapOffset: { left: string; bottom: string };
}>`
  transition: left 200ms ease-out, bottom 200ms ease-out;
  top: 0;
  right: 0;
  left: ${(props) => props.mapOffset?.left || '0'};
  bottom: ${(props) => props.mapOffset?.bottom || '0'};
`;

const MyAreaMapContainer = styled.div`
  position: relative;
  height: 100%;
  overflow: hidden;
`;

const MyAreaMapOffset = styled.div`
  height: 100%;
  position: relative;
`;

const MyAreaContainer = styled.div<{ height: string }>`
  display: flex;
  flex-direction: column;
  height: ${(props) => props.height};
`;

const MyAreaMap = styled(Map)`
  position: absolute;
`;

const baseLayerOptions: TileLayerOptions = {
  subdomains: ['t1', 't2', 't3', 't4'],
  tms: true,
  attribution:
    '<a href="https://github.com/amsterdam/amsterdam-react-maps">Amsterdam React Maps</a>',
};

function AttributionToggle() {
  const isDesktop = useDesktopScreen();
  const mapInstance = useMapInstance();

  useEffect(() => {
    const control = mapInstance.attributionControl.getContainer();
    if (control) {
      control.style.display = isDesktop ? 'block' : 'none';
    }
  }, [isDesktop, mapInstance]);

  return null;
}

interface MyAreaProps {
  datasetIds?: string[];
  showPanels?: boolean;
  showHeader?: boolean;
  height?: string;
  zoom?: number;
}

export default function MyArea({
  datasetIds,
  showPanels = true,
  showHeader = true,
  height = '100vh',
  zoom = HOOD_ZOOM,
}: MyAreaProps) {
  const isDesktop = useDesktopScreen();
  const { HOME } = useAppStateGetter();
  const termReplace = useTermReplacement();
  const location = useLocation();
  const center = HOME.content?.latlng;

  const mapOptions: Partial<L.MapOptions> = useMemo(() => {
    const options = {
      ...DEFAULT_MAP_OPTIONS,
      zoom,
    };
    if (center) {
      options.center = center;
    }
    return options;
  }, [center, zoom]);

  const datasetIdsRequested = useMemo(() => {
    if (datasetIds) {
      return datasetIds;
    }
    if (location.search) {
      const queryParams = new URLSearchParams(location.search);
      const ids = queryParams?.get('datasetIds')?.split(',');
      if (ids) {
        return ids.flatMap((id) =>
          id in DATASETS ? Object.keys(DATASETS[id]) : id
        );
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [mapOffset, setMapOffset] = useState({
    left: '0',
    bottom: isDesktop ? '0' : `${PhonePanelPadding.TOP}px`,
  });

  const onTogglePanel = useCallback(
    (state: PanelState, panelHeight: number = PhonePanelPadding.TOP) => {
      if (isDesktop) {
        setMapOffset(
          state === PanelState.Open
            ? { left: `${DESKTOP_PANEL_WIDTH}px`, bottom: '0' }
            : { left: `${DESKTOP_PANEL_TOGGLE_BUTTON_WIDTH}px`, bottom: '0' }
        );
      } else {
        // TODO: Sensible value here, determine when we don't want the controls to be connected to the panel anymore
        const bottomOffset =
          panelHeight > 10 * PhonePanelPadding.TOP
            ? PhonePanelPadding.TOP
            : panelHeight;
        setMapOffset(
          state === PanelState.Open
            ? { left: '0', bottom: `${bottomOffset}px` }
            : state === PanelState.Preview
            ? { left: '0', bottom: `${PREVIEW_PANEL_HEIGHT}px` }
            : { left: '0', bottom: `${PhonePanelPadding.TOP}px` }
        );
      }
    },
    [isDesktop]
  );

  return (
    <ThemeProvider>
      <MyAreaContainer height={height}>
        {!!showHeader && <MyAreaHeader />}
        <MyAreaMapContainer>
          <MyAreaMapOffset>
            <MyAreaMap
              fullScreen={true}
              aria-label={`Uitgebreide kaart van ${termReplace(
                ChapterTitles.BUURT
              ).toLowerCase()}`}
              options={mapOptions}
            >
              <AttributionToggle />
              {HOME.content?.address && !!center && (
                <HomeIconMarker
                  label={getFullAddress(HOME.content.address, true)}
                  center={center}
                  zoom={zoom}
                />
              )}
              <StyledViewerContainer
                mapOffset={mapOffset}
                bottomRight={
                  <>
                    {HOME.content?.address && HOME.content?.latlng && (
                      <HomeControlButton
                        zoom={zoom}
                        latlng={HOME.content.latlng}
                      />
                    )}
                    <Zoom />
                  </>
                }
                bottomLeft={
                  <BaseLayerToggle
                    aerialLayers={[AERIAL_AMSTERDAM_LAYERS[0]]}
                    topoLayers={[DEFAULT_AMSTERDAM_LAYERS[0]]}
                    options={baseLayerOptions}
                  />
                }
              />

              <MyAreaDatasets datasetIds={datasetIdsRequested} />
            </MyAreaMap>
            {!HOME.content?.address && (
              <MyAreaLoadingIndicator label="Uw adres wordt opgezocht" />
            )}
          </MyAreaMapOffset>

          {!!showPanels && <MyAreaPanels onTogglePanel={onTogglePanel} />}
        </MyAreaMapContainer>
      </MyAreaContainer>
    </ThemeProvider>
  );
}
