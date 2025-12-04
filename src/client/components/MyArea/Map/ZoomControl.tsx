import { memo } from 'react';

import { Button } from '@amsterdam/design-system-react';
import { useMapInstance } from '@amsterdam/react-maps';

import styles from './ZoomControl.module.scss';
import { IconEnlarge, IconMinimise } from '../../../assets/icons';

function ZoomControl() {
  const mapInstance = useMapInstance();

  const handleZoom = (out = false) => {
    mapInstance.setZoom(mapInstance.getZoom() + (out ? -1 : 1));
  };

  return (
    <div id="map-zoom" className={styles.ZoomBar}>
      <Button
        className={styles.Button}
        variant="tertiary"
        title="Inzoomen"
        onClick={() => {
          handleZoom();
        }}
        icon={IconEnlarge}
      >
        <span className="ams-visually-hidden">Zoom in op de kaart</span>
      </Button>
      <Button
        className={styles.Button}
        variant="tertiary"
        title="Uitzoomen"
        onClick={() => {
          handleZoom(true);
        }}
        icon={IconMinimise}
      >
        <span className="ams-visually-hidden">Zoom uit op de kaart</span>
      </Button>
    </div>
  );
}

export default memo(ZoomControl);
