import React, { useRef, useEffect, useState, PropsWithChildren } from 'react';
import { firstChildOfType } from './utils';
import { MaPopup } from './MaPopup';
import { MaTooltip } from './MaTooltip';
import iconUrl from 'assets/icons/home.svg';

import L from 'leaflet';
import { Marker, useMapInstance } from '@datapunt/react-maps';
import { DEFAULT_ZOOM, Centroid } from 'config/Map.constants';
import { toLatLng } from 'helpers/geo';

function useBindComponentToMarker(component: any, markerInstance: any) {
  const componentRef = useRef();
  let name = '';
  if (component) {
    component = React.cloneElement(component, {
      ref: componentRef,
    });
    name = component.type.displayName;
  }
  useEffect(() => {
    if (componentRef.current && markerInstance) {
      // Use the name of the child component to complete the bind method call.
      // For example passing a Popup component will result in bindPopup(ref.current)
      markerInstance['bind' + name](componentRef.current);
    }
  }, [componentRef, markerInstance, name]);

  return component;
}

type MaMarkerProps = PropsWithChildren<{ center: Centroid; iconUrl: string }>;

function MaMarker({ children, center, iconUrl }: MaMarkerProps) {
  const [markerInstance, setMarkerInstance] = useState();
  const popup = useBindComponentToMarker(
    firstChildOfType(children, MaPopup),
    markerInstance
  );
  const tooltip = useBindComponentToMarker(
    firstChildOfType(children, MaTooltip),
    markerInstance
  );
  const icon = L.icon({
    iconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    // popupAnchor: [1, -34],
    tooltipAnchor: [16, 0],
  });

  return (
    <>
      <Marker
        setInstance={setMarkerInstance}
        options={{ icon }}
        args={[toLatLng(center)]}
      />
      {popup}
      {tooltip}
    </>
  );
}

interface HomeIconMarkerProps {
  center: Centroid;
  address?: string;
  zoom?: number;
}

export function HomeIconMarker({
  center,
  zoom = DEFAULT_ZOOM,
  address,
}: HomeIconMarkerProps) {
  const mapInstance = useMapInstance();

  useEffect(() => {
    if (center && mapInstance) {
      mapInstance.setView(toLatLng(center), zoom);
    }
  }, [center, zoom, mapInstance]);

  return (
    <MaMarker iconUrl={iconUrl} center={center}>
      {!!address && <MaTooltip>{address}</MaTooltip>}
    </MaMarker>
  );
}
