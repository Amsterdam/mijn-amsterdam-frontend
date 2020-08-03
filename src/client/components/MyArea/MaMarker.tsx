import { Marker } from '@datapunt/arm-core';
import { useMapInstance } from '@datapunt/react-maps';
import L, { LeafletEventHandlerFn } from 'leaflet';
import React, { useCallback, useMemo } from 'react';
import { LOCATION_ZOOM } from '../../../universal/config/map';
import iconUrl from '../../assets/icons/home.svg';

interface MaMarkerProps {
  latlng: LatLngObject;
  iconUrl: string;
  onClick?: LeafletEventHandlerFn;
}

function MaMarker({ latlng, iconUrl, onClick }: MaMarkerProps) {
  const markerConfig = useMemo(() => {
    const icon = L.icon({
      iconUrl,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const events: { [key: string]: LeafletEventHandlerFn } = {};

    if (onClick) {
      events.click = (event: any) => console.log(event);
    }
    return { options: { icon }, events };
  }, [iconUrl, onClick]);

  return (
    <Marker
      latLng={latlng}
      options={markerConfig.options}
      events={markerConfig.events}
    />
  );
}

interface HomeIconMarkerProps {
  center: LatLngObject;
  zoom?: number;
}

export function HomeIconMarker({
  center,
  zoom = LOCATION_ZOOM,
}: HomeIconMarkerProps) {
  const mapInstance = useMapInstance();

  const onClick = useCallback(() => {
    console.log('hiah');
    if (!mapInstance) {
      return null;
    }
    console.log('setview');
    mapInstance.setView(center, zoom);
  }, [zoom, center, mapInstance]);

  console.log('iconUrl', iconUrl);

  return <MaMarker iconUrl={iconUrl} latlng={center} onClick={onClick} />;
}
