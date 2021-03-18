import {
  BaseLayerToggle,
  constants,
  Map,
  ViewerContainer,
  Zoom,
} from '@amsterdam/arm-core';
import { ThemeProvider } from '@amsterdam/asc-ui';
import { useMapInstance } from '@amsterdam/react-maps';
import L, { LatLngLiteral, TileLayerOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { ChapterTitles, HOOD_ZOOM } from '../../../universal/config';
import { getFullAddress, isLoading } from '../../../universal/helpers';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import {
  getElementSize,
  useAppStateGetter,
  useTermReplacement,
  useWidescreen,
} from '../../hooks';
import MaintenanceNotifications from '../MaintenanceNotifications/MaintenanceNotifications';
import { LegendPanel } from './LegendPanel/LegendPanel';
import {
  PanelState,
  WIDE_PANEL_TIP_WIDTH,
  WIDE_PANEL_WIDTH,
} from './LegendPanel/PanelComponent';
import { useLegendPanelCycle } from './LegendPanel/panelCycle';
import MyAreaCustomLocationControlButton from './MyAreaCustomLocationControlButton';
import { MyAreaDatasets } from './MyAreaDatasets';
import MyAreaHeader from './MyAreaHeader';
import HomeControlButton from './MyAreaHomeControlButton';
import MyAreaLoadingIndicator from './MyAreaLoadingIndicator';
import { CustomLatLonMarker, HomeIconMarker } from './MyAreaMarker';

const StyledViewerContainer = styled(ViewerContainer)<{
  mapOffset?: { left: string };
}>`
  transition: left 200ms ease-out, bottom 200ms ease-out;
  top: 0;
  right: 0;
  left: ${(props) => props.mapOffset?.left || '0'};
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

const MyAreaContainer = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  height: 100vh;
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
  const isWideScreen = useWidescreen();
  const mapInstance = useMapInstance();

  useEffect(() => {
    const control = mapInstance.attributionControl.getContainer();
    if (control) {
      control.style.display = isWideScreen ? 'block' : 'none';
    }
  }, [isWideScreen, mapInstance]);

  return null;
}

interface MyAreaProps {
  datasetIds?: string[];
  showPanels?: boolean;
  showHeader?: boolean;
  zoom?: number;
}

export default function MyArea({
  datasetIds,
  showPanels = true,
  showHeader = true,
  zoom = HOOD_ZOOM,
}: MyAreaProps) {
  const isWideScreen = useWidescreen();
  const isNarrowScreen = !isWideScreen;
  const { HOME } = useAppStateGetter();
  const termReplace = useTermReplacement();
  const location = useLocation();
  const center = HOME.content?.latlng;

  const mapContainerRef = useRef(null);
  const panelComponentAvailableHeight = getElementSize(mapContainerRef.current)
    .height;

  const queryParams = location.search
    ? new URLSearchParams(location.search)
    : null;
  const coordinateLabel = queryParams?.get('coordinateLabel') || '';
  const coordinate = queryParams?.get('coordinate') || null;

  const mapOptions: Partial<
    L.MapOptions & { center: LatLngLiteral }
  > = useMemo(() => {
    const options = {
      ...DEFAULT_MAP_OPTIONS,
      zoom,
    };
    if (coordinate) {
      const [lat, lng] = coordinate.split(',').map((n) => parseFloat(n));
      if (lat && lng) {
        options.center = { lat, lng };
      } else if (center) {
        options.center = center;
      }
    } else if (center) {
      options.center = center;
    }
    return options;
  }, [center, coordinate, zoom]);

  const datasetIdsRequested = useMemo(() => {
    if (queryParams) {
      const ids = queryParams?.get('datasetIds')?.split(',');
      if (ids?.length) {
        return ids;
      }
    }
    if (Array.isArray(datasetIds) && datasetIds.length) {
      return datasetIds;
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapLayers = useMemo(() => {
    return {
      aerial: [constants.AERIAL_AMSTERDAM_LAYERS[0]],
      topo: [constants.DEFAULT_AMSTERDAM_LAYERS[0]],
    };
  }, []);

  const { detailState, filterState } = useLegendPanelCycle();

  const mapOffset = useMemo(() => {
    if (isWideScreen) {
      if (filterState === PanelState.Open || detailState === PanelState.Open) {
        return { left: WIDE_PANEL_WIDTH };
      }
      return { left: WIDE_PANEL_TIP_WIDTH };
    }
    return;
  }, [isWideScreen, detailState, filterState]);

  return (
    <ThemeProvider>
      <MyAreaContainer>
        <MaintenanceNotifications page="buurt" />
        {!!showHeader && <MyAreaHeader showCloseButton={true} />}
        <MyAreaMapContainer ref={mapContainerRef}>
          <MyAreaMapOffset id="skip-to-id-Map">
            <MyAreaMap
              fullScreen={true}
              aria-label={`Uitgebreide kaart van ${termReplace(
                ChapterTitles.BUURT
              ).toLowerCase()}`}
              options={mapOptions}
            >
              <AttributionToggle />
              {HOME.content?.address && center && (
                <HomeIconMarker
                  label={getFullAddress(HOME.content.address, true)}
                  center={center}
                  zoom={zoom}
                />
              )}
              {coordinate && mapOptions.center && (
                <CustomLatLonMarker
                  label={coordinateLabel || 'Gekozen locatie'}
                  center={mapOptions.center}
                  zoom={zoom}
                />
              )}
              <StyledViewerContainer
                mapOffset={mapOffset}
                topLeft={
                  isNarrowScreen && (
                    <BaseLayerToggle
                      aerialLayers={mapLayers.aerial}
                      topoLayers={mapLayers.topo}
                      options={baseLayerOptions}
                    />
                  )
                }
                topRight={
                  isNarrowScreen &&
                  HOME.content?.address &&
                  HOME.content?.latlng && (
                    <HomeControlButton
                      zoom={zoom}
                      latlng={HOME.content.latlng}
                    />
                  )
                }
                bottomRight={
                  isWideScreen && (
                    <>
                      {coordinate && mapOptions.center && (
                        <MyAreaCustomLocationControlButton
                          zoom={zoom}
                          latlng={mapOptions.center}
                        />
                      )}
                      {HOME.content?.address && HOME.content?.latlng && (
                        <HomeControlButton
                          zoom={zoom}
                          latlng={HOME.content.latlng}
                        />
                      )}
                      <Zoom />
                    </>
                  )
                }
                bottomLeft={
                  isWideScreen && (
                    <BaseLayerToggle
                      aerialLayers={mapLayers.aerial}
                      topoLayers={mapLayers.topo}
                      options={baseLayerOptions}
                    />
                  )
                }
              />

              <MyAreaDatasets datasetIds={datasetIdsRequested} />
            </MyAreaMap>
            {!HOME.content?.address && isLoading(HOME) && (
              <MyAreaLoadingIndicator label="Uw adres wordt opgezocht" />
            )}
          </MyAreaMapOffset>

          {!!showPanels && (
            <LegendPanel availableHeight={panelComponentAvailableHeight} />
          )}
        </MyAreaMapContainer>
      </MyAreaContainer>
    </ThemeProvider>
  );
}
