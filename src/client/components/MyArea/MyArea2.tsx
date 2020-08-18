import {
  BaseLayer,
  BaseLayerToggle,
  Map,
  MapPanelProvider,
  ViewerContainer,
  Zoom,
} from '@datapunt/arm-core';
import { SnapPoint } from '@datapunt/arm-core/es/components/MapPanel/constants';
import { ThemeProvider } from '@datapunt/asc-ui';
import { themeSpacing } from '@datapunt/asc-ui/lib/utils/themeUtils';
import React, { useState } from 'react';
import styled from 'styled-components';
import { HOOD_ZOOM } from '../../../universal/config/map';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import { useDesktopScreen } from '../../hooks';
import { useAppStateGetter } from '../../hooks/useAppState';
import { HomeIconMarker } from './MaMarker';
import MyAreaDatasets from './MyAreaDatasets';
import MyAreaLoader from './MyAreaLoader';
import MyAreaPanels from './MyAreaPanels';
import { MaSuperClusterLayer } from './MyAreaSuperCluster';
import 'leaflet/dist/leaflet.css';

const StyledViewerContainer = styled(ViewerContainer)`
  height: 100%;
  left: ${themeSpacing(8)};
`;

const MyAreaMap = styled(Map)`
  position: absolute;

  .leaflet-tile-pane {
    z-index: 400;
  }
`;

export default function MyArea2() {
  const isDesktop = useDesktopScreen();
  const [useLeafletCluster, setUseLeafletCluster] = useState(false);
  const { HOME, KVK, BRP } = useAppStateGetter();
  // const profileType = useProfileTypeValue();
  // const address =
  //   (profileType === 'private'
  //     ? BRP.content?.adres
  //     : KVK.content?.vestigingen[0].bezoekadres) || null;

  // const homeAddress = getFullAddress(address);

  const center = HOME.content?.latlng;

  return (
    <ThemeProvider>
      {!!center ? (
        <MyAreaMap
          fullScreen={true}
          aria-label="Uitebreide kaart van mijn buurt"
          // events={{
          //   zoomend: (e: any) => {
          //     console.log('zzzz');
          //     setZoom(e.target._zoom);
          //   },
          // }}
          options={{
            ...DEFAULT_MAP_OPTIONS,
            zoom: HOOD_ZOOM,
            center,
          }}
        >
          <BaseLayer />

          <HomeIconMarker center={center} />
          <StyledViewerContainer
            bottomRight={
              <>
                <button
                  onClick={() => setUseLeafletCluster(!useLeafletCluster)}
                >
                  {useLeafletCluster ? 'LC' : 'SC'}
                </button>
                <Zoom />
              </>
            }
            bottomLeft={<BaseLayerToggle />}
          />
          <MapPanelProvider
            variant={isDesktop ? 'panel' : 'drawer'}
            initialPosition={SnapPoint.Full}
          >
            <MyAreaPanels />
            {useLeafletCluster ? <MyAreaDatasets /> : <MaSuperClusterLayer />}
          </MapPanelProvider>
        </MyAreaMap>
      ) : (
        <MyAreaLoader />
      )}
    </ThemeProvider>
  );
}
