import { useMapInstance } from '@amsterdam/react-maps';
import { useRef, useEffect } from 'react';

export function useMapRef() {
  const mapInstance = useMapInstance();
  const mapInstanceRef = useRef(mapInstance);

  useEffect(() => {
    if (mapInstance) {
      mapInstanceRef.current = mapInstance;
    }
  }, [mapInstance]);

  return mapInstanceRef;
}
