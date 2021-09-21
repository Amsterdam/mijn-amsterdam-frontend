import { IconButton } from '../../components/Button/Button';
import { useMapInstance } from '@amsterdam/react-maps';
import styles from './Map/Zoom.module.scss';
import { IconHomeSimple, IconHomeCommercial } from '../../assets/icons';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { HOOD_ZOOM } from '../../../universal/config/buurt';
import { LatLngLiteral } from 'leaflet';

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
