import { constants } from '@amsterdam/arm-core';
import Map from './Map/Map';
import { ThemeProvider } from '@amsterdam/asc-ui';
import { BaseLayerType } from '@amsterdam/arm-core/lib/components/BaseLayerToggle';
import { useMapInstance } from '@amsterdam/react-maps';
import L, { LatLngLiteral, TileLayerOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef } from 'react';
import { ChapterTitles, HOOD_ZOOM } from '../../../universal/config';
import { getFullAddress, isLoading } from '../../../universal/helpers';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import {
  getElementSize,
  useAppStateGetter,
  useTermReplacement,
  useWidescreen,
} from '../../hooks';
import MaintenanceNotifications from '../MaintenanceNotifications/MaintenanceNotifications';
import { LegendPanel } from './LegendPanel/LegendPanel';
import {
  PanelState,
  WIDE_PANEL_TIP_WIDTH,
  WIDE_PANEL_WIDTH,
} from './LegendPanel/PanelComponent';
import { useLegendPanelCycle } from './LegendPanel/panelCycle';
import { getQueryConfig } from './MyArea.hooks';
import MyAreaCustomLocationControlButton from './MyAreaCustomLocationControlButton';
import { MyAreaDatasets } from './MyAreaDatasets';
import MyAreaHeader from './MyAreaHeader';
import HomeControlButton from './MyAreaHomeControlButton';
import MyAreaLoadingIndicator from './MyAreaLoadingIndicator';
import { CustomLatLonMarker, HomeIconMarker } from './MyAreaMarker';
import styles from './MyArea.module.scss';
import ViewerContainer from './Map/ViewerContainer';
import BaseLayerToggle from './Map/BaseLayerToggle';
import Zoom from './Map/Zoom';

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

export interface MyAreaProps {
  datasetIds?: string[];
  showPanels?: boolean;
  showHeader?: boolean;
  zoom?: number;
  centerMarker?: { latlng: LatLngLiteral; label: string };
  height?: string;
  activeBaseLayerType?: BaseLayerType;
}

export default function MyArea({
  datasetIds,
  showPanels = true,
  showHeader = true,
  centerMarker,
  zoom = HOOD_ZOOM,
  height,
  activeBaseLayerType = BaseLayerType.Topo,
}: MyAreaProps) {
  const isWideScreen = useWidescreen();
  const isNarrowScreen = !isWideScreen;
  const { HOME } = useAppStateGetter();
  const termReplace = useTermReplacement();

  // Params passed by query will override all other options
  const customConfig = useMemo(() => {
    return getQueryConfig();
  }, []);

  const mapContainerRef = useRef(null);
  const panelComponentAvailableHeight = getElementSize(
    mapContainerRef.current
  ).height;

  const centerMarkerLabel = centerMarker?.label;
  const centerMarkerLatLng = centerMarker?.latlng;

  zoom = customConfig.zoom || zoom;

  const center = useMemo(() => {
    let center = DEFAULT_MAP_OPTIONS.center;

    if (customConfig.center) {
      center = customConfig.center;
    } else if (centerMarkerLatLng) {
      center = centerMarkerLatLng;
    } else if (HOME.content?.latlng) {
      center = HOME.content?.latlng;
    }

    return center;
  }, [centerMarkerLatLng, HOME.content, customConfig.center]);

  const mapOptions: Partial<L.MapOptions & { center: LatLngLiteral }> =
    useMemo(() => {
      const options = {
        ...DEFAULT_MAP_OPTIONS,
        zoom,
      };
      if (center) {
        options.center = center;
      }
      return options;
    }, [center, zoom]);

  const mapLayers = useMemo(() => {
    return {
      aerial: [constants.AERIAL_AMSTERDAM_LAYERS[0]],
      topo: [constants.DEFAULT_AMSTERDAM_LAYERS[0]],
    };
  }, []);

  const { detailState, filterState } = useLegendPanelCycle();

  const mapOffset = useMemo(() => {
    if (!showPanels) {
      return { left: '0' };
    }
    if (isWideScreen) {
      if (filterState === PanelState.Open || detailState === PanelState.Open) {
        return { left: WIDE_PANEL_WIDTH };
      }
      return { left: WIDE_PANEL_TIP_WIDTH };
    }
    return;
  }, [isWideScreen, showPanels, detailState, filterState]);

  return (
    <ThemeProvider>
      <div className={styles.Container}>
        <MaintenanceNotifications page="buurt" />
        {!!showHeader && <MyAreaHeader showCloseButton={true} />}
        <div className={styles.MapContainer} ref={mapContainerRef}>
          <div className={styles.MapOffset} id="skip-to-id-Map">
            <Map
              fullScreen={true}
              aria-label={`Kaart van ${termReplace(
                ChapterTitles.BUURT
              ).toLowerCase()}`}
              options={mapOptions}
            >
              <AttributionToggle />
              {!centerMarkerLatLng &&
                HOME.content?.address &&
                HOME.content?.latlng && (
                  <HomeIconMarker
                    label={getFullAddress(HOME.content.address, true)}
                    center={HOME.content?.latlng}
                    zoom={zoom}
                  />
                )}
              {centerMarkerLatLng && mapOptions.center && (
                <CustomLatLonMarker
                  label={centerMarkerLabel || 'Gekozen locatie'}
                  center={mapOptions.center}
                  zoom={zoom}
                />
              )}
              <ViewerContainer
                mapOffset={mapOffset}
                topLeft={
                  isNarrowScreen && (
                    <BaseLayerToggle
                      activeLayer={activeBaseLayerType}
                      aerialLayers={mapLayers.aerial}
                      topoLayers={mapLayers.topo}
                      options={baseLayerOptions}
                    />
                  )
                }
                topRight={
                  isNarrowScreen && (
                    <>
                      {centerMarkerLatLng && mapOptions.center && (
                        <MyAreaCustomLocationControlButton
                          zoom={zoom}
                          latlng={mapOptions.center}
                        />
                      )}
                      {!centerMarkerLatLng &&
                        HOME.content?.address &&
                        HOME.content?.latlng && (
                          <HomeControlButton
                            zoom={zoom}
                            latlng={HOME.content.latlng}
                          />
                        )}
                      <Zoom />
                    </>
                  )
                }
                bottomRight={
                  isWideScreen && (
                    <>
                      {centerMarkerLatLng && mapOptions.center && (
                        <MyAreaCustomLocationControlButton
                          zoom={zoom}
                          latlng={mapOptions.center}
                        />
                      )}
                      {!centerMarkerLatLng &&
                        HOME.content?.address &&
                        HOME.content?.latlng && (
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
                      activeLayer={activeBaseLayerType}
                      aerialLayers={mapLayers.aerial}
                      topoLayers={mapLayers.topo}
                      options={baseLayerOptions}
                    />
                  )
                }
              />
              {(!!datasetIds?.length || showPanels) && (
                <MyAreaDatasets datasetIds={datasetIds} />
              )}
            </Map>
            {!HOME.content?.address && isLoading(HOME) && (
              <MyAreaLoadingIndicator label="Uw adres wordt opgezocht" />
            )}
          </div>

          {!!showPanels && (
            <LegendPanel availableHeight={panelComponentAvailableHeight} />
          )}
        </div>
      </div>
    </ThemeProvider>
  );
}
