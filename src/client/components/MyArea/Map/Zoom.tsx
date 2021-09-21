import { Enlarge, Minimise } from '@amsterdam/asc-assets';
import { useMapInstance } from '@amsterdam/react-maps';
import { memo } from 'react';
import styles from './Zoom.module.scss';
import { IconButton } from '../../Button/Button';

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
        iconSize={'22px'}
        data-testid="zoomIn"
        onClick={() => {
          handleZoom();
        }}
        icon={Enlarge}
      />
      <IconButton
        className={styles.Button}
        type="button"
        title="Uitzoomen"
        iconSize={'22px'}
        data-testid="zoomOut"
        onClick={() => {
          handleZoom(true);
        }}
        icon={Minimise}
      />
    </div>
  );
};

export default memo(Zoom);
