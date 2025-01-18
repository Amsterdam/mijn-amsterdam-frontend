import { Button } from '@amsterdam/design-system-react';
import {
  BuildingsIcon,
  HousingIcon,
} from '@amsterdam/design-system-react-icons';
import { useMapInstance } from '@amsterdam/react-maps';
import { LatLngLiteral } from 'leaflet';

import styles from './Map/Zoom.module.scss';
import { HOOD_ZOOM } from '../../../universal/config/myarea-datasets';
import { useProfileTypeValue } from '../../hooks/useProfileType';

interface MyAreaHomeControlButtonProps {
  latlng: LatLngLiteral;
  zoom?: number;
}

export default function MyAreaHomeControlButton({
  latlng,
  zoom = HOOD_ZOOM,
}: MyAreaHomeControlButtonProps) {
  const profileType = useProfileTypeValue();
  const mapInstance = useMapInstance();
  return (
    <Button
      className={styles.Button}
      icon={profileType === 'private' ? HousingIcon : BuildingsIcon}
      iconOnly
      variant="tertiary"
      onClick={() => {
        mapInstance.setView(latlng, zoom);
      }}
    />
  );
}
