import {
  BaseLayerToggle,
  MapPanelProvider,
  ViewerContainer,
  Zoom,
} from '@datapunt/arm-core';
import { SnapPoint } from '@datapunt/arm-core/es/components/MapPanel/constants';
import React, { useState } from 'react';
import styled from 'styled-components';
import {
  DEFAULT_MAP_DISPLAY_CONFIG,
  MapDisplayOptions,
} from '../../config/map';
import { useDesktopScreen } from '../../hooks';
import { MaMap } from './MaMap';
import { HomeIconMarker } from './MaMarker';
import MyAreaLoader from './MyAreaLoader';
import MyAreaPanels from './MyAreaPanels';
import { LOCATION_ZOOM } from '../../../universal/config/map';
import { themeSpacing } from '@datapunt/asc-ui/lib/utils/themeUtils';
import MyAreaDatasets from './MyAreaDatasets';
import { MaSuperClusterLayer } from './MyAreaSuperCluster';

interface MyAreaMapComponentProps {
  title?: string;
  center?: LatLngObject | null;
  homeAddress?: string;
  options?: MapDisplayOptions;
}

const StyledViewerContainer = styled(ViewerContainer)`
  height: 100%;
  left: ${themeSpacing(8)};
`;

export default function MyArea2({
  center,
  title = 'Kaart van Mijn buurt',
  homeAddress,
  options = DEFAULT_MAP_DISPLAY_CONFIG,
}: MyAreaMapComponentProps) {
  const isDesktop = useDesktopScreen();
  const [useLeafletCluster, setUseLeafletCluster] = useState(false);

  return !!center ? (
    <MaMap title={title} zoom={options.zoom} center={center}>
      <HomeIconMarker center={center} zoom={LOCATION_ZOOM} />
      <StyledViewerContainer
        bottomRight={
          <>
            <button onClick={() => setUseLeafletCluster(!useLeafletCluster)}>
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
    </MaMap>
  ) : (
    <MyAreaLoader />
  );
}
