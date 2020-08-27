import {
  BaseLayer,
  BaseLayerToggle,
  Map,
  ViewerContainer,
  Zoom,
  MapPanelProvider,
} from '@datapunt/arm-core';
import { SnapPoint } from '@datapunt/arm-core/es/components/MapPanel/constants';
import {
  AERIAL_AMSTERDAM_LAYERS,
  DEFAULT_AMSTERDAM_LAYERS,
} from '@datapunt/arm-core/lib/constants';
import { ThemeProvider } from '@datapunt/asc-ui';
import { themeSpacing } from '@datapunt/asc-ui/lib/utils/themeUtils';
import 'leaflet/dist/leaflet.css';
import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { HOOD_ZOOM } from '../../../universal/config/map';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import { useDesktopScreen } from '../../hooks';
import { useAppStateGetter } from '../../hooks/useAppState';
import { HomeIconMarker } from './MaMarker';
import MyAreaHeader from './MyAreaHeader';
import MyAreaLoader from './MyAreaLoader';
import MyAreaPanels from './MyAreaPanels';
import MyAreaDatasets, { selectedMarkerDataAtom } from './MyAreaDatasets';
import { MaSuperClusterLayer } from './MyAreaSuperCluster';
import { useRecoilState } from 'recoil';
import axios from 'axios';

const StyledViewerContainer = styled(ViewerContainer)`
  height: 100%;
  left: ${themeSpacing(8)};
`;

const MyAreaMapContainer = styled.div`
  position: relative;
  height: 100%;
`;

const MyArea2Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const MyAreaMap = styled(Map)`
  position: absolute;

  .leaflet-tile-pane {
    z-index: 400;
  }
`;

export default function MyArea2() {
  const isDesktop = useDesktopScreen();
  const [useLeafletCluster, setUseLeafletCluster] = useState(true);
  const { HOME /*KVK, BRP*/ } = useAppStateGetter();
  const [selectedMarkerData, setSelectedMarkerData] = useRecoilState(
    selectedMarkerDataAtom
  );
  // const profileType = useProfileTypeValue();
  // const address =
  //   (profileType === 'private'
  //     ? BRP.content?.adres
  //     : KVK.content?.vestigingen[0].bezoekadres) || null;

  // const homeAddress = getFullAddress(address);

  const center = HOME.content?.latlng;
  // TODO: Move into final component solution (SuperCluster or MarkerCluster)
  const onMarkerClick = useCallback(
    (event: any) => {
      const datasetItemId = event?.layer?.feature?.properties?.dataset
        ? event?.layer?.feature?.properties?.dataset[0]
        : event.layer.options.datasetItemId;

      if (selectedMarkerData?.datasetItemId !== datasetItemId) {
        const datasetGroupId = event?.layer?.feature?.properties?.dataset
          ? event?.layer?.feature?.properties?.dataset[2]
          : event.layer.options.datasetGroupId;
        const datasetId = event?.layer?.feature?.properties?.dataset
          ? event?.layer?.feature?.properties?.dataset[1]
          : event.layer.options.datasetId;

        axios({
          url: `/test-api/bff/map/datasets/${datasetGroupId}/${datasetItemId}`,
        })
          .then(({ data: { content: markerData } }) => {
            setSelectedMarkerData({
              datasetItemId,
              datasetGroupId,
              datasetId,
              markerData,
            });
          })
          .catch((error) => {
            console.error('request error', error);
          });
      }
    },
    [setSelectedMarkerData, selectedMarkerData]
  );

  return (
    <ThemeProvider>
      <MyArea2Container>
        <MyAreaHeader />
        <MyAreaMapContainer>
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
                bottomLeft={
                  <BaseLayerToggle
                    aerialLayers={[AERIAL_AMSTERDAM_LAYERS[0]]}
                    topoLayers={[DEFAULT_AMSTERDAM_LAYERS[0]]}
                  />
                }
              />
              <MapPanelProvider
                variant={isDesktop ? 'panel' : 'drawer'}
                initialPosition={isDesktop ? SnapPoint.Full : SnapPoint.Closed}
              >
                <MyAreaPanels />
                {useLeafletCluster ? (
                  <MyAreaDatasets />
                ) : (
                  <MaSuperClusterLayer onMarkerClick={onMarkerClick} />
                )}
              </MapPanelProvider>
            </MyAreaMap>
          ) : (
            <MyAreaLoader />
          )}
        </MyAreaMapContainer>
      </MyArea2Container>
    </ThemeProvider>
  );
}
