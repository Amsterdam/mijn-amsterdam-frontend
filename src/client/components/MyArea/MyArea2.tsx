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
import React, { useCallback, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { ChapterTitles, HOOD_ZOOM } from '../../../universal/config';
import { getFullAddress } from '../../../universal/helpers';
import { BFFApiUrls } from '../../config/api';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import { useDesktopScreen } from '../../hooks';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import HomeControlButton from './MaHomeControlButton';
import { HomeIconMarker } from './MaMarker';
import { useSelectedMarkerData } from './MyArea.hooks';
import MyAreaHeader from './MyAreaHeader';
import MyAreaLoader from './MyAreaLoader';
import MyAreaPanels from './MyAreaPanels';
import { MyAreaPolyLineDatasets } from './MyAreaPolyLineDatasets';
import { MaSuperClusterLayer } from './MyAreaSuperCluster';

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

interface BuurtRouteParams {
  datasetGroupId?: string;
  datasetId?: string;
  datasetItemId?: string;
}

export default function MyArea2() {
  const isDesktop = useDesktopScreen();
  const params = useParams<BuurtRouteParams>();
  const { HOME } = useAppStateGetter();
  const termReplace = useTermReplacement();
  const center = HOME.content?.latlng;
  const [
    selectedMarkerDataState,
    setSelectedMarkerData,
  ] = useSelectedMarkerData();

  const selectedMarkerData = useMemo(() => {
    if (!selectedMarkerDataState) {
      return {
        ...params,
      };
    }
    return selectedMarkerDataState;
  }, [selectedMarkerDataState, params]);

  const { datasetGroupId, datasetId, datasetItemId } = selectedMarkerData;

  useEffect(() => {
    if (!datasetItemId || !datasetGroupId || !datasetId) {
      return;
    }

    axios({
      url: `${BFFApiUrls.MAP_DATASETS}/${datasetGroupId}/${datasetId}/${datasetItemId}`,
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
        setSelectedMarkerData({
          datasetItemId,
          datasetGroupId,
          datasetId,
          markerData: 'error',
        });
      });
  }, [datasetGroupId, datasetId, datasetItemId, setSelectedMarkerData]);

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

        setSelectedMarkerData({
          datasetGroupId,
          datasetId,
          datasetItemId,
        });
      }
    },
    [selectedMarkerData, setSelectedMarkerData]
  );

  const onCloseDetailPanel = useCallback(() => {
    setSelectedMarkerData(null);
  }, [setSelectedMarkerData]);

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
                <MyAreaPanels onCloseDetailPanel={onCloseDetailPanel} />
                <MyAreaPolyLineDatasets onMarkerClick={onMarkerClick} />
                <MaSuperClusterLayer onMarkerClick={onMarkerClick} />
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
