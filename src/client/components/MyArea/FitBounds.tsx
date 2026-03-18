import { useMemo } from 'react';

import { useMapInstance } from '@amsterdam/react-maps';
import type { LatLngLiteral } from 'leaflet';
import L from 'leaflet';

interface FitBoundsProps {
  latlngs: LatLngLiteral[];
}

export function FitBounds({ latlngs }: FitBoundsProps) {
  const bounds = useMemo(() => L.latLngBounds(latlngs), [latlngs]);
  const map = useMapInstance();
  map.fitBounds(bounds);
  return null;
}
