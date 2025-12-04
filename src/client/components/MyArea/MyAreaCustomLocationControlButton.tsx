import { Button } from '@amsterdam/design-system-react';
import { useMapInstance } from '@amsterdam/react-maps';
import { LatLngLiteral } from 'leaflet';

import styles from './Map/ZoomControl.module.scss';
import { HOOD_ZOOM } from '../../../universal/config/myarea-datasets';
import { IconPin } from '../../assets/icons/map';

interface MyAreaCustomLocationControlButtonProps {
  latlng: LatLngLiteral;
  zoom?: number;
  label: string;
}

export default function MyAreaCustomLocationControlButton({
  latlng,
  zoom = HOOD_ZOOM,
  label,
}: MyAreaCustomLocationControlButtonProps) {
  const mapInstance = useMapInstance();
  return (
    <Button
      className={styles.Button}
      icon={IconPin}
      variant="tertiary"
      onClick={() => {
        mapInstance.setView(latlng, zoom);
      }}
    >
      <span className="ams-visually-hidden">{label}</span>
    </Button>
  );
}
