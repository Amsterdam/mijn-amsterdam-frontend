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
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import React, { useCallback, useState } from 'react';
import { useRecoilState } from 'recoil';
import styled from 'styled-components';
import { HOOD_ZOOM } from '../../../universal/config/map';
import { getFullAddress } from '../../../universal/helpers';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import { useDesktopScreen } from '../../hooks';
import { useAppStateGetter } from '../../hooks/useAppState';
import { PARKEERZONES_POLYLINE_OPTIONS } from './datasets';
import HomeControlButton from './MaHomeControlButton';
import { HomeIconMarker } from './MaMarker';
import { MaPolyLineLayer } from './MaPolyLineLayer';
import MyAreaDatasets, {
  selectedMarkerDataAtom,
  useActiveDatasetIds,
} from './MyAreaDatasets';
import MyAreaHeader from './MyAreaHeader';
import MyAreaLoader from './MyAreaLoader';
import MyAreaPanels from './MyAreaPanels';
import { MaSuperClusterLayer } from './MyAreaSuperCluster';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import { ChapterTitles } from '../../../universal/config';
import { BFFApiUrls } from '../../config/api';

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
  const { HOME } = useAppStateGetter();
  const [selectedMarkerData, setSelectedMarkerData] = useRecoilState(
    selectedMarkerDataAtom
  );
  const activeDatasetIds = useActiveDatasetIds();
  const termReplace = useTermReplacement();
  const center = HOME.content?.latlng;
  // TODO: Move into final component solution (SuperCluster or MarkerCluster)
  const onMarkerClick = useCallback(
    (event: any) => {
      const datasetItemId = event?.layer?.feature?.properties?.dataset
        ? event?.layer?.feature?.properties?.dataset[0]
        : event.layer.options.datasetItemId
        ? event.layer.options.datasetItemId
        : event?.layer?.feature?.properties?.datasetItemId;

      if (selectedMarkerData?.datasetItemId !== datasetItemId) {
        const datasetGroupId = event?.layer?.feature?.properties?.dataset
          ? event?.layer?.feature?.properties?.dataset[2]
          : event.layer.options.datasetGroupId
          ? event.layer.options.datasetGroupId
          : event?.layer?.feature?.properties?.datasetGroupId;
        const datasetId = event?.layer?.feature?.properties?.dataset
          ? event?.layer?.feature?.properties?.dataset[1]
          : event.layer.options.datasetId
          ? event.layer.options.datasetId
          : event?.layer?.feature?.properties?.datasetId;

        axios({
          url: `${BFFApiUrls.MAP_DATASETS_DETAIL}/${
            datasetGroupId || datasetId
          }/${datasetItemId}`,
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
            console.error('map request error', error);
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
              aria-label={`Uitebreide kaart van ${termReplace(
                ChapterTitles.BUURT
              ).toLowerCase()}`}
              options={{
                ...DEFAULT_MAP_OPTIONS,
                zoom: HOOD_ZOOM,
                center,
              }}
            >
              <BaseLayer />
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
                    <button
                      onClick={() => setUseLeafletCluster(!useLeafletCluster)}
                    >
                      {useLeafletCluster ? 'LC' : 'SC'}
                    </button>
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
              <MapPanelProvider
                variant={isDesktop ? 'panel' : 'drawer'}
                initialPosition={isDesktop ? SnapPoint.Full : SnapPoint.Closed}
              >
                <MyAreaPanels />
                {activeDatasetIds.includes('parkeerzones') && (
                  <MaPolyLineLayer
                    url="https://map.data.amsterdam.nl/maps/parkeerzones?"
                    polylineOptions={PARKEERZONES_POLYLINE_OPTIONS.parkeerzones}
                    datasetId="parkeerzones"
                    datasetGroupId="parkeren"
                    onMarkerClick={onMarkerClick}
                  />
                )}
                {activeDatasetIds.includes('parkeerzones_uitzondering') && (
                  <MaPolyLineLayer
                    url="https://map.data.amsterdam.nl/maps/parkeerzones_uitzondering?"
                    polylineOptions={
                      PARKEERZONES_POLYLINE_OPTIONS.parkeerzones_uitzondering
                    }
                    datasetId="parkeerzones_uitzondering"
                    datasetGroupId="parkeren"
                    onMarkerClick={onMarkerClick}
                  />
                )}
                {useLeafletCluster ? (
                  <MyAreaDatasets onMarkerClick={onMarkerClick} />
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
