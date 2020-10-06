import { Marker } from '@amsterdam/arm-core';
import L, { LeafletEventHandlerFn, Marker as MarkerType } from 'leaflet';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LOCATION_ZOOM } from '../../../universal/config/map';
import iconUrl from '../../assets/icons/home.svg';
import iconUrlCommercial from '../../assets/icons/map/homeCommercial__primary-red.svg';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useMapRef } from './useMap';
import styles from './MyArea.module.scss';

interface MaMarkerProps {
  latlng: LatLngObject;
  iconUrl: string;
  onClick?: LeafletEventHandlerFn;
  label?: string;
}

function MaMarker({ latlng, iconUrl, onClick, label }: MaMarkerProps) {
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

  const [markerInstance, setInstance] = useState<MarkerType | undefined>(
    undefined
  );

  useEffect(() => {
    if (markerInstance && label) {
      markerInstance.unbindTooltip().bindTooltip(label, {
        className: styles.MarkerText,
        permanent: true,
        offset: [0, 40],
        direction: 'center',
      });
    }
  }, [markerInstance, label]);

  const latLngObject = useMemo(() => {
    return new L.LatLng(latlng.lat, latlng.lng);
  }, [latlng]);

  return (
    <Marker
      latLng={latLngObject}
      options={markerConfig.options}
      events={markerConfig.events}
      setInstance={(markerInstance) => setInstance(markerInstance)}
    />
  );
}

interface HomeIconMarkerProps {
  center: LatLngObject;
  address: string;
  zoom?: number;
}

export const HomeIconMarker = function HomeIconMarker({
  center,
  zoom = LOCATION_ZOOM,
  address = '',
}: HomeIconMarkerProps) {
  const mapRef = useMapRef();
  const profileType = useProfileTypeValue();

  const homeIconUrl = useMemo(() => {
    return profileType === 'private' ? iconUrl : iconUrlCommercial;
  }, [profileType]);

  const doCenter = useCallback(() => {
    if (!mapRef.current) {
      return null;
    }
    mapRef.current.setView(center, zoom);
  }, [zoom, center, mapRef]);

  useEffect(() => {
    doCenter();
  }, [doCenter]);

  return (
    <MaMarker
      key={profileType}
      iconUrl={homeIconUrl}
      onClick={doCenter}
      latlng={center}
      label={address}
    />
  );
};
