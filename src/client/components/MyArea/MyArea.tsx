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
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { ChapterTitles, HOOD_ZOOM } from '../../../universal/config';
import { DATASETS } from '../../../universal/config/buurt';
import { getFullAddress } from '../../../universal/helpers';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import { useDesktopScreen } from '../../hooks';
import { useAppStateGetter } from '../../hooks/useAppState';
import { getElementSize } from '../../hooks/useComponentSize';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import LegendControl from './LegendControl';
import {
  useFetchPanelFeature,
  useLoadingFeature,
  useSelectedFeature,
} from './MyArea.hooks';
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
  PHONE_PANEL_PREVIEW_HEIGHT,
  PHONE_PANEL_TIP_HEIGHT,
  usePanelStateCycle,
} from './MyAreaPanelComponent';
import { MyAreaLegendPanel } from './MyAreaPanels';
import MyAreaDetailPanel from './PanelContent/MyAreaDetailPanel';
import { usePhoneScreen } from '../../hooks/media.hook';

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
  position: relative;
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

function nextMapOffset(isDesktop: boolean, state: PanelState) {
  return isDesktop
    ? state === PanelState.Open
      ? { left: DESKTOP_PANEL_WIDTH, bottom: '0' }
      : { left: '0', bottom: '0' }
    : state === PanelState.Preview
    ? { left: '0', bottom: PHONE_PANEL_PREVIEW_HEIGHT }
    : { left: '0', bottom: PHONE_PANEL_TIP_HEIGHT };
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
  const isPhone = usePhoneScreen();
  const { HOME } = useAppStateGetter();
  const termReplace = useTermReplacement();
  const location = useLocation();
  const center = HOME.content?.latlng;
  const [, setSelectedFeature] = useSelectedFeature();
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

  const mapContainerRef = useRef(null);

  const panelComponentAvailableHeight = getElementSize(mapContainerRef.current)
    .height;

  const panelCycle = useMemo(() => {
    if (isPhone) {
      return {
        filters: [PanelState.Preview, PanelState.Open],
        detail: [PanelState.Closed, PanelState.Preview, PanelState.Open],
      };
    }
    return {
      filters: [PanelState.Open, PanelState.Closed],
      detail: [PanelState.Closed, PanelState.Open],
    };
  }, [isPhone]);

  const {
    state: filterState,
    initial: initialFilterPanelState,
    set: setFilterPanelState,
    cycle: cycleFilterPanelState,
  } = usePanelStateCycle('filters', panelCycle.filters);

  const {
    state: detailState,
    set: setDetailPanelState,
    initial: setInitialDetailPanelState,
  } = usePanelStateCycle('detail', panelCycle.detail);

  const [mapOffset, setMapOffset] = useState(
    nextMapOffset(isDesktop, filterState)
  );

  useEffect(() => {
    if (
      filterState === PanelState.Closed &&
      detailState === PanelState.Preview
    ) {
      setMapOffset(nextMapOffset(isDesktop, detailState));
    } else {
      setMapOffset(nextMapOffset(isDesktop, filterState));
    }
  }, [filterState, detailState, isDesktop]);

  const onCloseDetailPanel = useCallback(() => {
    setInitialDetailPanelState();
  }, [setInitialDetailPanelState]);

  const toggleFilterPanel = useCallback(() => {
    if (isDesktop) {
      cycleFilterPanelState();
    } else {
      if (filterState === panelCycle.filters[0]) {
        setFilterPanelState(PanelState.Closed);
      } else if (filterState === PanelState.Closed) {
        initialFilterPanelState();
      }
    }
  }, [
    isDesktop,
    filterState,
    setFilterPanelState,
    initialFilterPanelState,
    cycleFilterPanelState,
  ]);

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

  return (
    <ThemeProvider>
      <MyAreaContainer height={height}>
        {!!showHeader && <MyAreaHeader showCloseButton={false} />}
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
                  <>
                    <LegendControl
                      isActive={filterState !== PanelState.Closed}
                      showDesktopVariant={isDesktop}
                      onClick={toggleFilterPanel}
                    />
                    {isPhone && (
                      <BaseLayerToggle
                        aerialLayers={[AERIAL_AMSTERDAM_LAYERS[0]]}
                        topoLayers={[DEFAULT_AMSTERDAM_LAYERS[0]]}
                        options={baseLayerOptions}
                      />
                    )}
                  </>
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
                cycle={panelCycle.filters}
                // onTogglePanel={onTogglePanel}
                availableHeight={panelComponentAvailableHeight}
              >
                <MyAreaLegendPanel />
              </PanelComponent>

              <PanelComponent
                id="detail"
                cycle={panelCycle.detail}
                // onTogglePanel={onTogglePanel}
                onClose={onCloseDetailPanel}
                availableHeight={panelComponentAvailableHeight}
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
