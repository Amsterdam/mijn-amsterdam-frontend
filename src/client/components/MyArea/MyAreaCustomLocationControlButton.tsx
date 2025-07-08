import { Button } from '@amsterdam/design-system-react';
import { useMapInstance } from '@amsterdam/react-maps';
import { LatLngLiteral } from 'leaflet';

import styles from './Map/Zoom.module.scss';
import { HOOD_ZOOM } from '../../../universal/config/myarea-datasets.ts';
import { IconPin } from '../../assets/icons/map/index.tsx';

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
    <Button
      className={styles.Button}
      icon={IconPin}
      iconOnly
      variant="tertiary"
      onClick={() => {
        mapInstance.setView(latlng, zoom);
      }}
    />
  );
}
