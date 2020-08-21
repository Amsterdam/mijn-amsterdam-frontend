import { Marker } from '@datapunt/arm-core';
import L, { LeafletEventHandlerFn } from 'leaflet';
import React, { useCallback, useMemo } from 'react';
import { LOCATION_ZOOM } from '../../../universal/config/map';
import iconUrl from '../../assets/icons/home.svg';
import iconUrlCommercial from '../../assets/icons/Suitcase__primary-red.svg';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useMapRef } from './useMap';

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
      events.click = onClick;
    }

    return { options: { icon }, events };
  }, [iconUrl, onClick]);

  const latLngObject = useMemo(() => {
    return new L.LatLng(latlng.lat, latlng.lng);
  }, [latlng]);

  return (
    <Marker
      latLng={latLngObject}
      options={markerConfig.options}
      events={markerConfig.events}
    />
  );
}

interface HomeIconMarkerProps {
  center: LatLngObject;
  zoom?: number;
}

export const HomeIconMarker = function HomeIconMarker({
  center,
  zoom = LOCATION_ZOOM,
}: HomeIconMarkerProps) {
  const mapRef = useMapRef();
  const profileType = useProfileTypeValue();

  const homeIconUrl = useMemo(() => {
    return profileType === 'private' ? iconUrl : iconUrlCommercial;
  }, [profileType]);

  const onClick = useCallback(() => {
    if (!mapRef.current) {
      return null;
    }
    mapRef.current.setView(center, zoom);
  }, [zoom, center, mapRef]);

  return (
    <MaMarker
      key={profileType}
      iconUrl={homeIconUrl}
      onClick={onClick}
      latlng={center}
    />
  );
};
