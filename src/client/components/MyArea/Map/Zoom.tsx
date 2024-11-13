import { memo } from 'react';

import { Button } from '@amsterdam/design-system-react';
import { useMapInstance } from '@amsterdam/react-maps';

import styles from './Zoom.module.scss';
import { IconEnlarge, IconMinimise } from '../../../assets/icons';

const Zoom: React.FC = () => {
  const mapInstance = useMapInstance();

  const handleZoom = (out = false) => {
    mapInstance.setZoom(mapInstance.getZoom() + (out ? -1 : 1));
  };

  return (
    <div className={styles.ZoomBar}>
      <Button
        className={styles.Button}
        type="button"
        variant="secondary"
        title="Inzoomen"
        onClick={() => {
          handleZoom();
        }}
        icon={IconEnlarge}
      />
      <Button
        className={styles.Button}
        type="button"
        variant="secondary"
        title="Uitzoomen"
        onClick={() => {
          handleZoom(true);
        }}
        icon={IconMinimise}
      />
    </div>
  );
};

export default memo(Zoom);
