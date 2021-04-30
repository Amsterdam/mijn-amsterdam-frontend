import { ControlButton } from '@amsterdam/arm-core';
import { useMapInstance } from '@amsterdam/react-maps';
import { LatLngLiteral } from 'leaflet';
import { HOOD_ZOOM } from '../../../universal/config/buurt';
import { IconPin } from '../../assets/icons/map';

interface MyAreaCustomLocationControlButtonProps {
  latlng: LatLngLiteral;
  zoom?: number;
}

export default function MyAreaCustomLocationControlButton({
  latlng,
  zoom = HOOD_ZOOM,
}: MyAreaCustomLocationControlButtonProps) {
  const mapInstance = useMapInstance();
  return (
    <ControlButton
      variant="blank"
      type="button"
      icon={<IconPin />}
      size={44}
      iconSize={26}
      onClick={() => {
        mapInstance.setView(latlng, zoom);
      }}
    />
  );
}
