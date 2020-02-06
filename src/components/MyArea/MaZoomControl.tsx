import React from 'react';
import classnames from 'classnames';
import { Centroid, LOCATION_ZOOM } from 'config/Map.constants';
import { ReactComponent as HomeIconSimple } from 'assets/icons/home-simple.svg';

import styles from './MyArea.module.scss';
import { useMapInstance } from '@datapunt/react-maps';

interface ZoomControlComponentProps {
  center: Centroid;
  homeZoom?: number;
}

type ZoomButtonProps = WithChildren<HTMLButtonElement, 'type'>;

function ZoomControlButton({ children, className, ...props }: ZoomButtonProps) {
  return (
    <button {...props} className={classnames(styles.ZoomButton, className)}>
      {children}
    </button>
  );
}

function ZoomButton({ children, className, ...props }: ZoomButtonProps) {
  return (
    <ZoomControlButton {...props} className={styles.ZoomInOutButton}>
      {children}
    </ZoomControlButton>
  );
}

export function MaZoomControl({
  center,
  homeZoom = LOCATION_ZOOM,
}: ZoomControlComponentProps) {
  const mapInstance = useMapInstance();
  return (
    <div className={styles.ZoomControl}>
      <ZoomControlButton
        onClick={() => mapInstance && mapInstance.setView(center, homeZoom)}
      >
        <HomeIconSimple fill="#000" />
      </ZoomControlButton>
      <ZoomButton onClick={() => mapInstance && mapInstance.zoomIn()}>
        &#43;
      </ZoomButton>
      <ZoomButton onClick={() => mapInstance && mapInstance.zoomOut()}>
        &minus;
      </ZoomButton>
    </div>
  );
}
