import { useMapInstance } from '@amsterdam/react-maps';
import L, { LatLngLiteral, TileLayerOptions } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
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
import BaseLayerToggle, {
  AERIAL_AMSTERDAM_LAYERS,
  BaseLayerType,
  DEFAULT_AMSTERDAM_LAYERS,
} from './Map/BaseLayerToggle';
import Map from './Map/Map';
import ViewerContainer from './Map/ViewerContainer';
import Zoom from './Map/Zoom';
import { getQueryConfig } from './MyArea.hooks';
import styles from './MyArea.module.scss';
import MyAreaCustomLocationControlButton from './MyAreaCustomLocationControlButton';
import { MyAreaDatasets } from './MyAreaDatasets';
import HomeControlButton from './MyAreaHomeControlButton';
import MyAreaLoadingIndicator from './MyAreaLoadingIndicator';
import { CustomLatLonMarker, HomeIconMarker } from './MyAreaMarker';

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
  zoom?: number;
  centerMarker?: { latlng: LatLngLiteral; label: string };
  activeBaseLayerType?: BaseLayerType;
}

function updateViewportHeight() {
  document.documentElement.style.setProperty(
    '--map-container-height',
    `${window.innerHeight - 150}px`
  );
}

export default function MyArea({
  datasetIds,
  showPanels = true,
  centerMarker,
  zoom = HOOD_ZOOM,
  activeBaseLayerType = BaseLayerType.Topo,
}: MyAreaProps) {
  const isWideScreen = useWidescreen();
  const isNarrowScreen = !isWideScreen;
  const { MY_LOCATION } = useAppStateGetter();
  const termReplace = useTermReplacement();
  const history = useHistory();
  // Params passed by query will override all other options
  const customConfig = useMemo(() => {
    return getQueryConfig(history.location.search);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const mapContainerRef = useRef<HTMLDivElement>(null);
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
    } else if (MY_LOCATION.content?.latlng) {
      center = MY_LOCATION.content?.latlng;
    }

    return center;
  }, [centerMarkerLatLng, MY_LOCATION.content, customConfig.center]);

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
      aerial: [AERIAL_AMSTERDAM_LAYERS[0]],
      topo: [DEFAULT_AMSTERDAM_LAYERS[0]],
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

  const ariaLabel = `Kaart van ${termReplace(
    ChapterTitles.BUURT
  ).toLowerCase()}`;

  useEffect(() => {
    window.addEventListener('resize', updateViewportHeight);
    return () => window.removeEventListener('resize', updateViewportHeight);
  }, []);

  const [isReadyToRender, setIsReadyToRender] = useState(false);

  useEffect(() => {
    updateViewportHeight();
    setIsReadyToRender(true);
  }, [setIsReadyToRender]);

  return (
    <div className={styles.Container}>
      <MaintenanceNotifications page="buurt" />
      <div className={styles.MapContainer} ref={mapContainerRef}>
        <div className={styles.MapOffset} id="skip-to-id-Map">
          {isReadyToRender && (
            <Map fullScreen={true} aria-label={ariaLabel} options={mapOptions}>
              <AttributionToggle />
              {!centerMarkerLatLng &&
                MY_LOCATION.content?.address &&
                MY_LOCATION.content?.latlng && (
                  <HomeIconMarker
                    label={getFullAddress(MY_LOCATION.content.address, true)}
                    center={MY_LOCATION.content?.latlng}
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
                        MY_LOCATION.content?.address &&
                        MY_LOCATION.content?.latlng && (
                          <HomeControlButton
                            zoom={zoom}
                            latlng={MY_LOCATION.content.latlng}
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
                        MY_LOCATION.content?.address &&
                        MY_LOCATION.content?.latlng && (
                          <HomeControlButton
                            zoom={zoom}
                            latlng={MY_LOCATION.content.latlng}
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
          )}
          {!MY_LOCATION.content?.address && isLoading(MY_LOCATION) && (
            <MyAreaLoadingIndicator label="Uw adres wordt opgezocht" />
          )}
        </div>

        {!!showPanels && (
          <LegendPanel availableHeight={panelComponentAvailableHeight} />
        )}
      </div>
    </div>
  );
}
