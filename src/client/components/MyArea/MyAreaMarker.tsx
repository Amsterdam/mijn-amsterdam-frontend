import { useCallback, useEffect, useMemo, useState } from 'react';

import L, {
  LatLngLiteral,
  LeafletEventHandlerFn,
  Marker as MarkerType,
  MarkerOptions,
} from 'leaflet';

import Marker from './Map/Marker.tsx';
import styles from './MyArea.module.scss';
import { useMapRef } from './useMap.ts';
import { LOCATION_ZOOM } from '../../../universal/config/myarea-datasets.ts';
import iconUrl from '../../assets/icons/home.svg';
import iconUrlCommercial from '../../assets/icons/map/homeCommercial__primary-red.svg';
import markerIconUrl from '../../assets/icons/map/pin.svg';
import { useProfileTypeValue } from '../../hooks/useProfileType.ts';

interface MyAreaMarkerProps {
  latlng: LatLngLiteral;
  iconUrl: string;
  onClick?: LeafletEventHandlerFn;
  label?: string;
  alt?: string;
}

function MyAreaMarker({
  latlng,
  iconUrl,
  onClick,
  label,
  alt,
}: MyAreaMarkerProps) {
  const markerConfig = useMemo(() => {
    const ICON_SIZE = 32;
    const ICON_ANCHOR = 16;
    const icon = L.icon({
      iconUrl,
      iconSize: [ICON_SIZE, ICON_SIZE],
      iconAnchor: [ICON_ANCHOR, ICON_ANCHOR],
    });

    const events: { [key: string]: LeafletEventHandlerFn } = {};

    if (onClick) {
      events.click = onClick;
    }

    const marker: { options: MarkerOptions; events: any } = {
      options: { icon },
      events,
    };
    if (alt) {
      marker.options.alt = alt;
    }
    return marker;
  }, [iconUrl, onClick, alt]);

  const [markerInstance, setInstance] = useState<MarkerType | undefined>(
    undefined
  );

  useEffect(() => {
    if (markerInstance && label) {
      const MARKER_LABEL_OFFSET = 14;

      markerInstance
        .unbindTooltip()
        .bindTooltip(
          `<div aria-label="Locatiegegevens" class="${
            styles.MarkerLabelText
          }">${label.replace(/\n/g, '<br/>')}</div>`,
          {
            className: styles.MarkerLabel,
            permanent: true,
            offset: [0, MARKER_LABEL_OFFSET],
            direction: 'bottom',
          }
        );
    }
    return () => {
      markerInstance?.unbindTooltip();
    };
  }, [markerInstance, label]);

  const latLng = useMemo(() => {
    return new L.LatLng(latlng.lat, latlng.lng);
  }, [latlng]);

  return (
    <Marker
      latLng={latLng}
      options={markerConfig.options}
      events={markerConfig.events}
      setInstance={(markerInstance) => setInstance(markerInstance)}
    />
  );
}

interface HomeIconMarkerProps {
  center: LatLngLiteral;
  label: string;
  zoom?: number;
  autCenterOnLocationChange?: boolean;
}

export function HomeIconMarker({
  center,
  zoom = LOCATION_ZOOM,
  label = '',
  autCenterOnLocationChange = false,
}: HomeIconMarkerProps) {
  const mapRef = useMapRef();
  const profileType = useProfileTypeValue();

  const homeIconUrl = useMemo(() => {
    return profileType === 'private' ? iconUrl : iconUrlCommercial;
  }, [profileType]);

  const { lat, lng } = center;

  const doCenter = useCallback(() => {
    if (!mapRef.current) {
      return null;
    }
    if (mapRef.current.getCenter().lat !== lat) {
      mapRef.current.setView({ lat, lng }, zoom);
    }
  }, [zoom, lat, lng, mapRef]);

  useEffect(() => {
    if (autCenterOnLocationChange) {
      doCenter();
    }
  }, [autCenterOnLocationChange, doCenter]);

  return (
    <MyAreaMarker
      key={profileType}
      iconUrl={homeIconUrl}
      onClick={doCenter}
      latlng={center}
      label={label}
      alt="Thuislocatie icoon"
    />
  );
}

interface HomeIconMarkerProps {
  center: LatLngLiteral;
  label: string;
  zoom?: number;
  iconUrl?: string;
}

export function CustomLatLonMarker({
  center,
  zoom = LOCATION_ZOOM,
  label = '',
  iconUrl = markerIconUrl,
}: HomeIconMarkerProps) {
  const mapRef = useMapRef();

  const doCenter = useCallback(() => {
    if (!mapRef.current) {
      return null;
    }
    if (mapRef.current.getCenter().lat !== center.lat) {
      mapRef.current.setView(center, zoom);
    }
  }, [zoom, center, mapRef]);

  return (
    <MyAreaMarker
      iconUrl={iconUrl}
      onClick={doCenter}
      latlng={center}
      label={label}
      alt="Locatie icoon"
    />
  );
}
