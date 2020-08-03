import classnames from 'classnames';
import React from 'react';
import { IconHome } from '../../assets/icons';
import {
  DEFAULT_MAP_DISPLAY_CONFIG,
  MapDisplayOptions,
} from '../../config/map';
import { MaMap } from './MaMap';
import { HomeIconMarker } from './MaMarker';
import { MaZoomControl } from './MaZoomControl';
import styles from './MyArea2.module.scss';
import { MyAreaMapContainer } from './MyAreaMapContainer';

interface MyAreaMapComponentProps {
  id?: string;
  title?: string;
  center?: LatLngObject | null;
  homeAddress?: string;
  options?: MapDisplayOptions;
  className?: string;
}

function MyAreaLoader() {
  return (
    <div className={styles.MyAreaLoader}>
      <span>
        <IconHome aria-hidden="true" />
        Uw adres wordt opgezocht...
      </span>
    </div>
  );
}

export default function MyArea2({
  center,
  title = 'Kaart van Mijn buurt',
  id = 'map',
  homeAddress,
  options = DEFAULT_MAP_DISPLAY_CONFIG,
  className,
}: MyAreaMapComponentProps) {
  return (
    <MyAreaMapContainer className={classnames(styles.MyArea, className)}>
      {!!center ? (
        <MaMap title={title} id={id} zoom={options.zoom} center={center}>
          <HomeIconMarker
            center={center}
            zoom={options.zoom}
            address={homeAddress}
          />
          {!!options.zoomTools && <MaZoomControl center={center} />}
        </MaMap>
      ) : (
        <MyAreaLoader />
      )}
    </MyAreaMapContainer>
  );
}
