import {
  BaseLayerToggle,
  Map,
  MapPanelProvider,
  ViewerContainer,
  Zoom,
} from '@amsterdam/arm-core';
import { SnapPoint } from '@amsterdam/arm-core/es/components/MapPanel/constants';
import {
  AERIAL_AMSTERDAM_LAYERS,
  DEFAULT_AMSTERDAM_LAYERS,
} from '@amsterdam/arm-core/lib/constants';
import { ThemeProvider } from '@amsterdam/asc-ui';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useCallback, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { ChapterTitles, HOOD_ZOOM } from '../../../universal/config';
import { DATASETS, DatasetCategoryId } from '../../../universal/config/buurt';
import { getFullAddress } from '../../../universal/helpers';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import { useDesktopScreen } from '../../hooks';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import HomeControlButton from './MyAreaHomeControlButton';
import { HomeIconMarker } from './MyAreaMarker';
import { MyAreaDatasets } from './MyAreaDatasets';
import MyAreaHeader from './MyAreaHeader';
import MyAreaLoadingIndicator from './MyAreaLoadingIndicator';
import MyAreaPanels from './MyAreaPanels';

const StyledViewerContainer = styled(ViewerContainer)<{ leftOffset: string }>`
  height: 100%;
  left: ${(props) => props.leftOffset};
`;

const MyAreaMapContainer = styled.div`
  position: relative;
  height: 100%;
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

const baseLayerOptions = {
  subdomains: ['t1', 't2', 't3', 't4'],
  tms: true,
  attribution:
    '<a href="https://github.com/amsterdam/amsterdam-react-maps">Amsterdam React Maps</a>',
};

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

  const [mapOffsetLeft, setMapOffsetLeft] = useState('0');

  const onSetDrawerPosition = useCallback((drawerPosition: string) => {
    setMapOffsetLeft(drawerPosition);
  }, []);

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
              {HOME.content?.address && !!center && (
                <HomeIconMarker
                  label={getFullAddress(HOME.content.address, true)}
                  center={center}
                  zoom={zoom}
                />
              )}

              <StyledViewerContainer
                leftOffset={mapOffsetLeft}
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

          {!!showPanels && (
            <MapPanelProvider
              variant={isDesktop ? 'panel' : 'drawer'}
              initialPosition={isDesktop ? SnapPoint.Full : SnapPoint.Closed}
            >
              <MyAreaPanels onSetDrawerPosition={onSetDrawerPosition} />
            </MapPanelProvider>
          )}
        </MyAreaMapContainer>
      </MyAreaContainer>
    </ThemeProvider>
  );
}
