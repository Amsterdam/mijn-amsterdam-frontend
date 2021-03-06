import {
  BaseLayerToggle,
  Map,
  ViewerContainer,
  Zoom,
} from '@amsterdam/arm-core';
import { constants } from '@amsterdam/arm-core';
import { ThemeProvider } from '@amsterdam/asc-ui';
import { useMapInstance } from '@amsterdam/react-maps';
import L, { TileLayerOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import useMedia from 'use-media';
import { ChapterTitles, HOOD_ZOOM } from '../../../universal/config';
import { getFullAddress, isLoading } from '../../../universal/helpers';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import {
  useTermReplacement,
  getElementSize,
  useWidescreen,
  useAppStateGetter,
} from '../../hooks';
import {
  useFetchPanelFeature,
  useLoadingFeature,
  useResetMyAreaState,
} from './MyArea.hooks';
import { MyAreaDatasets } from './MyAreaDatasets';
import MyAreaHeader from './MyAreaHeader';
import HomeControlButton from './MyAreaHomeControlButton';
import MyAreaLoadingIndicator from './MyAreaLoadingIndicator';
import { HomeIconMarker } from './MyAreaMarker';
import {
  PanelComponent,
  PanelState,
  usePanelStateCycle,
  WIDE_PANEL_TIP_WIDTH,
  WIDE_PANEL_WIDTH,
} from './MyAreaPanelComponent';
import { MyAreaLegendPanel } from './MyAreaPanels';
import MyAreaDetailPanel from './PanelContent/MyAreaDetailPanel';
import { useSetLoadingFeature } from './MyArea.hooks';
import MaintenanceNotifications from '../MaintenanceNotifications/MaintenanceNotifications';

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
  const isLandscape = useMedia('(orientation: landscape)');
  const isNarrowScreen = !isWideScreen;
  const { HOME } = useAppStateGetter();
  const termReplace = useTermReplacement();
  const location = useLocation();
  const center = HOME.content?.latlng;
  const [loadingFeature] = useLoadingFeature();
  const prevFilterPanelState = useRef<PanelState | null>(null);
  const mapContainerRef = useRef(null);
  const panelComponentAvailableHeight = getElementSize(mapContainerRef.current)
    .height;
  const resetMyAreaState = useResetMyAreaState();

  useFetchPanelFeature();
  const setLoadingFeature = useSetLoadingFeature();

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
    if (location.search) {
      const queryParams = new URLSearchParams(location.search);
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

  const panelCycle = useMemo(() => {
    if (isWideScreen) {
      return {
        filters: [PanelState.Open, PanelState.Tip],
        detail: [PanelState.Closed, PanelState.Open],
      };
    }
    if (isLandscape) {
      return {
        filters: [PanelState.Tip, PanelState.Open],
        detail: [PanelState.Closed, PanelState.Open],
      };
    }
    return {
      filters: [PanelState.Tip, PanelState.Preview, PanelState.Open],
      detail: [PanelState.Closed, PanelState.Preview, PanelState.Open],
    };
  }, [isWideScreen, isLandscape]);

  const filterPanelCycle = usePanelStateCycle(
    'filters',
    panelCycle.filters,
    PanelState.Preview
  );
  const { state: filterState, set: setFilterPanelState } = filterPanelCycle;

  const detailPanelCycle = usePanelStateCycle('detail', panelCycle.detail);
  const { state: detailState, set: setDetailPanelState } = detailPanelCycle;

  useEffect(() => {
    if (isWideScreen) {
      setFilterPanelState(PanelState.Open);
    }
  }, [isWideScreen, setFilterPanelState]);

  // Reset state on unmount
  useEffect(() => {
    return () => {
      detailPanelCycle.reset();
      filterPanelCycle.reset();
      resetMyAreaState();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resetMyAreaState]);

  // Set panel state without explicit panel interaction. Effect reacts to loading detailed features.
  useEffect(() => {
    if (!loadingFeature) {
      return;
    }
    if (isNarrowScreen) {
      if (isLandscape) {
        setDetailPanelState(PanelState.Open);
      } else {
        setDetailPanelState(PanelState.Preview);
      }
    } else {
      setDetailPanelState(PanelState.Open);
    }
    // Only react on loadingFeature changes. This wil result in re-render which causes the currentPanel state to be up-to-date.
  }, [loadingFeature, isNarrowScreen, setDetailPanelState, isLandscape]);

  // If Detail panel is opened set FiltersPanel to a TIP state and store the State it's in, if Detail panel is closed restore the Filters panel state to the state it was in.
  useEffect(() => {
    if (detailState !== PanelState.Closed && !prevFilterPanelState.current) {
      prevFilterPanelState.current = filterState;
      setFilterPanelState(PanelState.Tip);
    } else if (
      detailState === PanelState.Closed &&
      prevFilterPanelState.current
    ) {
      setFilterPanelState(prevFilterPanelState.current);
      prevFilterPanelState.current = null;
    }
  }, [detailState, filterState, setFilterPanelState]);

  const mapOffset = useMemo(() => {
    if (isWideScreen) {
      if (filterState === PanelState.Open || detailState === PanelState.Open) {
        return { left: WIDE_PANEL_WIDTH };
      }
      return { left: WIDE_PANEL_TIP_WIDTH };
    }
    return;
  }, [isWideScreen, detailState, filterState]);

  const mapLayers = useMemo(() => {
    return {
      aerial: [constants.AERIAL_AMSTERDAM_LAYERS[0]],
      topo: [constants.DEFAULT_AMSTERDAM_LAYERS[0]],
    };
  }, []);

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
              {HOME.content?.address && !!center && (
                <HomeIconMarker
                  label={getFullAddress(HOME.content.address, true)}
                  center={center}
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
            <>
              <PanelComponent
                id="filters"
                cycle={filterPanelCycle}
                availableHeight={panelComponentAvailableHeight}
              >
                <MyAreaLegendPanel />
              </PanelComponent>
              <PanelComponent
                id="detail"
                cycle={detailPanelCycle}
                availableHeight={panelComponentAvailableHeight}
                onClose={() => setLoadingFeature(null)}
                showCloseButton={
                  isWideScreen || detailState === PanelState.Open
                }
              >
                <MyAreaDetailPanel />
              </PanelComponent>
            </>
          )}
        </MyAreaMapContainer>
      </MyAreaContainer>
    </ThemeProvider>
  );
}
