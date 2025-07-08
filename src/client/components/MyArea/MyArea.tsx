import { useEffect, useMemo, useRef, useState } from 'react';

import { useMapInstance } from '@amsterdam/react-maps';
import L, { LatLngLiteral, TileLayerOptions } from 'leaflet';

import { HOOD_ZOOM } from '../../../universal/config/myarea-datasets.ts';
import iconUrlCommercialSecondary from '../../assets/icons/map/homeSecondaryCommercial.svg';
import { DEFAULT_MAP_OPTIONS } from '../../config/map.ts';
import { useWidescreen } from '../../hooks/media.hook.ts';
import { getElementSize } from '../../hooks/useComponentSize.ts';
import { MaintenanceNotifications } from '../MaintenanceNotifications/MaintenanceNotifications.tsx';
import { LegendPanel } from './LegendPanel/LegendPanel.tsx';
import {
  PanelState,
  WIDE_PANEL_TIP_WIDTH,
  WIDE_PANEL_WIDTH,
} from './LegendPanel/PanelComponent.tsx';
import { useLegendPanelCycle } from './LegendPanel/panelCycle.ts';
import BaseLayerToggle, {
  AERIAL_AMSTERDAM_LAYERS,
  BaseLayerType,
  DEFAULT_AMSTERDAM_LAYERS,
} from './Map/BaseLayerToggle.tsx';
import Map from './Map/Map.tsx';
import ViewerContainer from './Map/ViewerContainer.tsx';
import Zoom from './Map/Zoom.tsx';
import { routeConfig } from './MyArea-thema-config.ts';
import {
  MapLocationMarker,
  useMapLocations,
  useSetMapCenterAtLocation,
} from './MyArea.hooks.ts';
import styles from './MyArea.module.scss';
import MyAreaCustomLocationControlButton from './MyAreaCustomLocationControlButton.tsx';
import { MyAreaDatasets } from './MyAreaDatasets.tsx';
import HomeControlButton from './MyAreaHomeControlButton.tsx';
import { CustomLatLonMarker, HomeIconMarker } from './MyAreaMarker.tsx';
import { useHTMLDocumentTitle } from '../../hooks/useHTMLDocumentTitle.ts';
import { AmsMainMenuClassname } from '../MainHeader/MainHeader.tsx';

const baseLayerOptions: TileLayerOptions = {
  subdomains: ['t1', 't2', 't3', 't4'],
  tms: true,
};

// The height of the header. If we account for it the full map will be onscreen and scrolling is only needed to reach the footer.
const HEADERHEIGHT = 119;

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
  showHomeLocationMarker?: boolean;
  showSecondaryLocationMarkers?: boolean;
}

function updateViewportHeight() {
  const headerHeight =
    document.querySelector(`.${AmsMainMenuClassname}`)?.getBoundingClientRect()
      .height ?? HEADERHEIGHT;
  document.documentElement.style.setProperty(
    '--map-container-height',
    `${globalThis.innerHeight - headerHeight}px`
  );
}

export default function MyArea({
  datasetIds,
  showPanels = true,
  centerMarker,
  zoom = HOOD_ZOOM,
  activeBaseLayerType = BaseLayerType.Topo,
  showHomeLocationMarker = true,
  showSecondaryLocationMarkers = true,
}: MyAreaProps) {
  useHTMLDocumentTitle(routeConfig.themaPage);

  const isWideScreen = useWidescreen();
  const isNarrowScreen = !isWideScreen;
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

  const ariaLabel = `Kaart van de buurt`;

  useEffect(() => {
    globalThis.addEventListener('resize', updateViewportHeight);
    return () => globalThis.removeEventListener('resize', updateViewportHeight);
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
              fullScreen
              aria-label={ariaLabel}
              options={mapOptions}
              setInstance={(mapInstance) => setMapInstance(mapInstance)}
            >
              <AttributionToggle />
              {showHomeLocationMarker && !!homeLocationMarker && (
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
              {showSecondaryLocationMarkers &&
                secondaryLocationMarkers.length &&
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
