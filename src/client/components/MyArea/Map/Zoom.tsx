import { useMapInstance } from '@amsterdam/react-maps';
import { memo } from 'react';
import styles from './Zoom.module.scss';
import { IconButton } from '../../Button/Button';
import { IconEnlarge, IconMinimise } from '../../../assets/icons';

const Zoom: React.FC = () => {
  const mapInstance = useMapInstance();

  const handleZoom = (out = false) => {
    mapInstance.setZoom(mapInstance.getZoom() + (out ? -1 : 1));
  };

  return (
    <div className={styles.ZoomBar}>
      <IconButton
        className={styles.Button}
        type="button"
        title="Inzoomen"
        iconSize="22"
        onClick={() => {
          handleZoom();
        }}
        icon={IconEnlarge}
      />
      <IconButton
        className={styles.Button}
        type="button"
        title="Uitzoomen"
        iconSize="22"
        onClick={() => {
          handleZoom(true);
        }}
        icon={IconMinimise}
      />
    </div>
  );
};

export default memo(Zoom);
