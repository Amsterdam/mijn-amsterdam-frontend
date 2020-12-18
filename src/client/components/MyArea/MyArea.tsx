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
import React, { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { ChapterTitles, HOOD_ZOOM } from '../../../universal/config';
import { DATASETS } from '../../../universal/config/buurt';
import { getFullAddress } from '../../../universal/helpers';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import { useDesktopScreen } from '../../hooks';
import { usePhoneScreen } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppState';
import { getElementSize } from '../../hooks/useComponentSize';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import { useFetchPanelFeature, useLoadingFeature } from './MyArea.hooks';
import { MyAreaDatasets } from './MyAreaDatasets';
import MyAreaHeader from './MyAreaHeader';
import HomeControlButton from './MyAreaHomeControlButton';
import MyAreaLoadingIndicator from './MyAreaLoadingIndicator';
import { HomeIconMarker } from './MyAreaMarker';
import {
  DESKTOP_PANEL_TIP_WIDTH,
  DESKTOP_PANEL_WIDTH,
  PanelComponent,
  PanelState,
  usePanelStateCycle,
} from './MyAreaPanelComponent';
import { MyAreaLegendPanel } from './MyAreaPanels';
import MyAreaDetailPanel from './PanelContent/MyAreaDetailPanel';

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
  height: 100%;
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
  height = '100%',
  zoom = HOOD_ZOOM,
}: MyAreaProps) {
  const isDesktop = useDesktopScreen();
  const isPhone = usePhoneScreen();
  const { HOME } = useAppStateGetter();
  const termReplace = useTermReplacement();
  const location = useLocation();
  const center = HOME.content?.latlng;
  const [loadingFeature] = useLoadingFeature();

  useFetchPanelFeature();

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

  const mapContainerRef = useRef(null);

  const panelComponentAvailableHeight = getElementSize(mapContainerRef.current)
    .height;

  const panelCycle = useMemo(() => {
    if (isDesktop) {
      return {
        filters: [PanelState.Open, PanelState.Tip],
        detail: [PanelState.Closed, PanelState.Open],
      };
    }
    return {
      filters: [PanelState.Tip, PanelState.Preview, PanelState.Open],
      detail: [PanelState.Closed, PanelState.Preview, PanelState.Open],
    };
  }, [isDesktop]);

  const filterPanelCycle = usePanelStateCycle(
    'filters',
    panelCycle.filters,
    isDesktop ? PanelState.Open : PanelState.Preview
  );
  const { state: filterState, set: setFilterPanelState } = filterPanelCycle;

  const detailPanelCycle = usePanelStateCycle('detail', panelCycle.detail);
  const { state: detailState, set: setDetailPanelState } = detailPanelCycle;

  // Set panel state without explicit panel interaction. Effect reacts to loading detailed features.
  useEffect(() => {
    if (!loadingFeature) {
      return;
    }
    if (isPhone) {
      setDetailPanelState(PanelState.Preview);
    } else {
      setDetailPanelState(PanelState.Open);
    }
    // Only react on loadingFeature changes. This wil result in re-render which causes the currentPanel state to be up-to-date.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingFeature, isPhone]);

  const prevFilterPanelState = useRef<PanelState | null>(null);

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
    if (isDesktop) {
      if (filterState === PanelState.Open || detailState === PanelState.Open) {
        return { left: DESKTOP_PANEL_WIDTH };
      }
      return { left: DESKTOP_PANEL_TIP_WIDTH };
    }
    return;
  }, [isDesktop, detailState, filterState]);

  return (
    <ThemeProvider>
      <MyAreaContainer>
        {!!showHeader && <MyAreaHeader showCloseButton={true} />}
        <MyAreaMapContainer ref={mapContainerRef}>
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
                topLeft={
                  isPhone && (
                    <BaseLayerToggle
                      aerialLayers={[AERIAL_AMSTERDAM_LAYERS[0]]}
                      topoLayers={[DEFAULT_AMSTERDAM_LAYERS[0]]}
                      options={baseLayerOptions}
                    />
                  )
                }
                topRight={
                  isPhone &&
                  HOME.content?.address &&
                  HOME.content?.latlng && (
                    <HomeControlButton
                      zoom={zoom}
                      latlng={HOME.content.latlng}
                    />
                  )
                }
                bottomRight={
                  isDesktop && (
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
                  isDesktop && (
                    <BaseLayerToggle
                      aerialLayers={[AERIAL_AMSTERDAM_LAYERS[0]]}
                      topoLayers={[DEFAULT_AMSTERDAM_LAYERS[0]]}
                      options={baseLayerOptions}
                    />
                  )
                }
              />

              <MyAreaDatasets datasetIds={datasetIdsRequested} />
            </MyAreaMap>
            {!HOME.content?.address && (
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
                showCloseButton={isDesktop || detailState === PanelState.Open}
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
