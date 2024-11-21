import { useMapInstance } from '@amsterdam/react-maps';
import { LatLngLiteral } from 'leaflet';

import styles from './Map/Zoom.module.scss';
import { HOOD_ZOOM } from '../../../universal/config/myarea-datasets';
import { IconHomeCommercial, IconHomeSimple } from '../../assets/icons';
import { IconButton } from '../../components/Button/Button';
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
    <IconButton
      type="button"
      className={styles.Button}
      icon={profileType === 'private' ? IconHomeSimple : IconHomeCommercial}
      iconSize={profileType === 'private' ? '40px' : '20px'}
      onClick={() => {
        mapInstance.setView(latlng, zoom);
      }}
    />
  );
}
