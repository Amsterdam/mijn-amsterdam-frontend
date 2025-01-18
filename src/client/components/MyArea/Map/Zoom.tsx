import { memo } from 'react';

import { Button } from '@amsterdam/design-system-react';
import { useMapInstance } from '@amsterdam/react-maps';

import styles from './Zoom.module.scss';
import { IconEnlarge, IconMinimise } from '../../../assets/icons';

function Zoom() {
  const mapInstance = useMapInstance();

  const handleZoom = (out = false) => {
    mapInstance.setZoom(mapInstance.getZoom() + (out ? -1 : 1));
  };

  return (
    <div className={styles.ZoomBar}>
      <Button
        className={styles.Button}
        variant="tertiary"
        title="Inzoomen"
        onClick={() => {
          handleZoom();
        }}
        icon={IconEnlarge}
      />
      <Button
        className={styles.Button}
        variant="tertiary"
        title="Uitzoomen"
        onClick={() => {
          handleZoom(true);
        }}
        icon={IconMinimise}
      />
    </div>
  );
}

export default memo(Zoom);
