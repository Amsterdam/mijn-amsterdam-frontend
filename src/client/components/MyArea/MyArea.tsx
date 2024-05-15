import { useMapInstance } from '@amsterdam/react-maps';
import L, { LatLngLiteral, TileLayerOptions } from 'leaflet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ThemaTitles, HOOD_ZOOM } from '../../../universal/config';
import { DEFAULT_MAP_OPTIONS } from '../../config/map';
import { getElementSize, useTermReplacement, useWidescreen } from '../../hooks';
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
import {
  MapLocationMarker,
  useMapLocations,
  useSetMapCenterAtLocation,
} from './MyArea.hooks';
import styles from './MyArea.module.scss';
import MyAreaCustomLocationControlButton from './MyAreaCustomLocationControlButton';
import { MyAreaDatasets } from './MyAreaDatasets';
import HomeControlButton from './MyAreaHomeControlButton';
import { CustomLatLonMarker, HomeIconMarker } from './MyAreaMarker';
import iconUrlCommercialSecondary from '../../assets/icons/map/homeSecondaryCommercial.svg';

const baseLayerOptions: TileLayerOptions = {
  subdomains: ['t1', 't2', 't3', 't4'],
  tms: true,
  attribution:
    '<a href="https://github.com/amsterdam/amsterdam-react-maps">Amsterdam React Maps</a>',
};

// The height of the header. If we account for it the full map will be onscreen and scrolling is only needed to reach the footer.
const HEADERHEIGHT = 150;

const mapLayers = {
  aerial: [AERIAL_AMSTERDAM_LAYERS[0]],
  topo: [DEFAULT_AMSTERDAM_LAYERS[0]],
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
  centerMarker?: MapLocationMarker;
  activeBaseLayerType?: BaseLayerType;
}

function updateViewportHeight() {
  document.documentElement.style.setProperty(
    '--map-container-height',
    `${window.innerHeight - HEADERHEIGHT}px`
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
  const termReplace = useTermReplacement();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const panelComponentAvailableHeight = getElementSize(
    mapContainerRef.current
  ).height;
  const [mapInstance, setMapInstance] = useState<L.Map>();

  const {
    mapCenter,
    mapZoom,
    homeLocationMarker,
    customLocationMarker,
    secondaryLocationMarkers,
  } = useMapLocations(centerMarker, zoom);

  // NOTE: Alos sets the zoom level / center passed via url
  useSetMapCenterAtLocation(
    mapInstance,
    mapZoom,
    customLocationMarker,
    homeLocationMarker
  );

  const mapOptions: Partial<L.MapOptions & { center: LatLngLiteral }> =
    useMemo(() => {
      const options = {
        ...DEFAULT_MAP_OPTIONS,
        zoom: mapZoom,
        center: mapCenter,
      };

      return options;
      // Disable hook dependencies, the mapOptions only need to be determined once.
      // Using memo here because we don't need the options to cause re-renders of the <Map/> component.
      // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const ariaLabel = `Kaart van ${termReplace(ThemaTitles.BUURT).toLowerCase()}`;

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
            <Map
              fullScreen={true}
              aria-label={ariaLabel}
              options={mapOptions}
              setInstance={(mapInstance) => setMapInstance(mapInstance)}
            >
              <AttributionToggle />
              {!!homeLocationMarker && (
                <HomeIconMarker
                  label={homeLocationMarker.label}
                  center={homeLocationMarker.latlng}
                  zoom={zoom}
                />
              )}
              {(!homeLocationMarker ||
                customLocationMarker.type === 'custom') &&
                customLocationMarker.latlng && (
                  <CustomLatLonMarker
                    label={customLocationMarker.label}
                    center={customLocationMarker.latlng}
                    zoom={zoom}
                  />
                )}
              {secondaryLocationMarkers.length &&
                secondaryLocationMarkers.map((location) => (
                  <CustomLatLonMarker
                    label={location.label}
                    center={location.latlng}
                    zoom={zoom}
                    iconUrl={iconUrlCommercialSecondary}
                    key={location.label}
                  />
                ))}
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
                      {(!homeLocationMarker ||
                        customLocationMarker.type === 'custom') && (
                        <MyAreaCustomLocationControlButton
                          zoom={zoom}
                          latlng={customLocationMarker.latlng}
                        />
                      )}
                      {!!homeLocationMarker && (
                        <HomeControlButton
                          zoom={zoom}
                          latlng={homeLocationMarker?.latlng}
                        />
                      )}
                      <Zoom />
                    </>
                  )
                }
                bottomRight={
                  isWideScreen && (
                    <>
                      {(!homeLocationMarker ||
                        customLocationMarker.type === 'custom') && (
                        <MyAreaCustomLocationControlButton
                          zoom={zoom}
                          latlng={customLocationMarker.latlng}
                        />
                      )}
                      {!!homeLocationMarker && (
                        <HomeControlButton
                          zoom={zoom}
                          latlng={homeLocationMarker?.latlng}
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
        </div>

        {!!showPanels && (
          <LegendPanel availableHeight={panelComponentAvailableHeight} />
        )}
      </div>
    </div>
  );
}
