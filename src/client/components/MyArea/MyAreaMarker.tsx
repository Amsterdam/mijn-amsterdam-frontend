import L, {
  LatLngLiteral,
  LeafletEventHandlerFn,
  Marker as MarkerType,
  MarkerOptions,
} from 'leaflet';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { LOCATION_ZOOM } from '../../../universal/config/myarea-datasets';
import iconUrl from '../../assets/icons/home.svg';
import iconUrlCommercial from '../../assets/icons/map/homeCommercial__primary-red.svg';
import markerIconUrl from '../../assets/icons/map/pin.svg';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import Marker from './Map/Marker';
import styles from './MyArea.module.scss';
import { useMapRef } from './useMap';

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
    const icon = L.icon({
      iconUrl,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
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
      markerInstance
        .unbindTooltip()
        .bindTooltip(
          `<div aria-label="Locatiegegevens" class="${
            styles.MarkerLabelText
          }">${label.replace(/\n/g, '<br/>')}</div>`,
          {
            className: styles.MarkerLabel,
            permanent: true,
            offset: [0, 14],
            direction: 'bottom',
          }
        );
    }
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
}

export function HomeIconMarker({
  center,
  zoom = LOCATION_ZOOM,
  label = '',
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
    if (mapRef.current.getCenter().lat !== center.lat) {
      mapRef.current.setView(center, zoom);
    }
  }, [zoom, center, mapRef]);

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
}

export function CustomLatLonMarker({
  center,
  zoom = LOCATION_ZOOM,
  label = '',
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

  useEffect(() => {
    doCenter();
  }, [doCenter]);

  return (
    <MyAreaMarker
      iconUrl={markerIconUrl}
      onClick={doCenter}
      latlng={center}
      label={label}
      alt="Locatie icoon"
    />
  );
}
