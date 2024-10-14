import { useEffect, useState } from 'react';

import { Marker as MarkerComponent } from '@amsterdam/react-maps';
import {
  LatLngLiteral,
  LeafletEventHandlerFn,
  Marker as MarkerType,
  MarkerOptions,
} from 'leaflet';

type Props = {
  latLng: LatLngLiteral;
  events?: { [key: string]: LeafletEventHandlerFn };
  options?: MarkerOptions;
  setInstance?: (markerInstance?: MarkerType) => void;
};

const Marker: React.FC<Props> = ({ latLng, events, options, setInstance }) => {
  const [markerInstance, setMarkerInstance] = useState<MarkerType>();

  useEffect(() => {
    if (markerInstance) {
      markerInstance.setLatLng(latLng);
    }
  }, [latLng, markerInstance]);

  useEffect(() => {
    if (!setInstance || !markerInstance) {
      return undefined;
    }

    setInstance(markerInstance);

    return () => {
      setInstance(undefined);
    };
  }, [markerInstance, setInstance]);

  return (
    <MarkerComponent
      setInstance={setMarkerInstance}
      args={[latLng]}
      events={events}
      options={{
        ...options,
      }}
    />
  );
};

export default Marker;
