import {
  BaseLayer,
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
import { themeSpacing } from '@amsterdam/asc-ui/lib/utils/themeUtils';
import 'leaflet/dist/leaflet.css';
import React, { useMemo } from 'react';
import styled from 'styled-components';
import { ChapterTitles, HOOD_ZOOM } from '../../../universal/config';
import { getFullAddress } from '../../../universal/helpers';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import { useDesktopScreen } from '../../hooks';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import HomeControlButton from './MaHomeControlButton';
import { HomeIconMarker } from './MaMarker';
import { MyAreaDatasets } from './MyAreaDatasets';
import MyAreaHeader from './MyAreaHeader';
import MyAreaLoadingIndicator from './MyAreaLoadingIndicator';
import MyAreaPanels from './MyAreaPanels';

const StyledViewerContainer = styled(ViewerContainer)`
  height: 100%;
  left: ${themeSpacing(8)};
`;

const MyAreaMapContainer = styled.div`
  position: relative;
  height: 100%;
`;

const MyAreaContainer = styled.div<{ height: string }>`
  display: flex;
  flex-direction: column;
  height: ${(props) => props.height};
`;

const MyAreaMap = styled(Map)`
  position: absolute;

  .leaflet-tile-pane {
    z-index: 400;
  }
`;

const baseLayerOptions = {
  attribution:
    '<a href="https://github.com/amsterdam/amsterdam-react-maps">Amsterdam React Maps</a>',
};

interface MyAreaProps {
  datasetIds?: string[];
  showPanels?: boolean;
  showHeader?: boolean;
  height?: string;
}

export default function MyArea({
  datasetIds,
  showPanels = true,
  showHeader = true,
  height = '100vh',
}: MyAreaProps) {
  const isDesktop = useDesktopScreen();
  const { HOME } = useAppStateGetter();
  const termReplace = useTermReplacement();
  const center = HOME.content?.latlng;
  const mapOptions: Partial<L.MapOptions> = useMemo(() => {
    const options = {
      ...DEFAULT_MAP_OPTIONS,
      zoom: HOOD_ZOOM,
    };
    if (center) {
      options.center = center;
    }
    return options;
  }, [center]);

  return (
    <ThemeProvider>
      <MyAreaContainer height={height}>
        {!!showHeader && <MyAreaHeader />}
        <MyAreaMapContainer>
          {!!center ? (
            <MyAreaMap
              fullScreen={true}
              aria-label={`Uitebreide kaart van ${termReplace(
                ChapterTitles.BUURT
              ).toLowerCase()}`}
              options={mapOptions}
            >
              <BaseLayer options={baseLayerOptions} />
              {HOME.content?.address && (
                <HomeIconMarker
                  address={getFullAddress(HOME.content.address, true)}
                  center={center}
                  zoom={HOOD_ZOOM}
                />
              )}
              <StyledViewerContainer
                bottomRight={
                  <>
                    {HOME.content?.address && HOME.content?.latlng && (
                      <HomeControlButton
                        zoom={HOOD_ZOOM}
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
                  />
                }
              />
              {!!showPanels && (
                <MapPanelProvider
                  variant={isDesktop ? 'panel' : 'drawer'}
                  initialPosition={
                    isDesktop ? SnapPoint.Full : SnapPoint.Closed
                  }
                >
                  <MyAreaPanels />
                </MapPanelProvider>
              )}
              <MyAreaDatasets datasetIds={datasetIds} />
            </MyAreaMap>
          ) : (
            <MyAreaLoadingIndicator />
          )}
        </MyAreaMapContainer>
      </MyAreaContainer>
    </ThemeProvider>
  );
}
