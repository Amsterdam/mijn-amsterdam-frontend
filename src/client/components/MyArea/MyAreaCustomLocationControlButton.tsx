import { useMapInstance } from '@amsterdam/react-maps';
import { LatLngLiteral } from 'leaflet';
import { HOOD_ZOOM } from '../../../universal/config/myarea-datasets';
import { IconPin } from '../../assets/icons/map';
import { IconButton } from '../../components/Button/Button';
import styles from './Map/Zoom.module.scss';

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
    <IconButton
      type="button"
      className={styles.Button}
      icon={IconPin}
      iconSize="32"
      onClick={() => {
        mapInstance.setView(latlng, zoom);
      }}
    />
  );
}
