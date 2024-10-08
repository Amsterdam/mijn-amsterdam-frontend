import { useRef, useEffect } from 'react';

import { useMapInstance } from '@amsterdam/react-maps';

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
