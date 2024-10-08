import { useMemo } from 'react';

import { useMapInstance } from '@amsterdam/react-maps';
import L, { LatLngLiteral } from 'leaflet';

interface FitBoundsProps {
  latlngs: LatLngLiteral[];
}

export function FitBounds({ latlngs }: FitBoundsProps) {
  const bounds = useMemo(() => L.latLngBounds(latlngs), [latlngs]);
  const map = useMapInstance();
  map.fitBounds(bounds);
  return null;
}
