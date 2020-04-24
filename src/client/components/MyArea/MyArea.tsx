import {
  DEFAULT_MAP_DISPLAY_CONFIG,
  IS_MY_AREA_2_ENABLED,
  MapDisplayOptions,
} from './MyArea.constants';
import { Link, NavLink } from 'react-router-dom';
import React, { HTMLProps, PropsWithChildren } from 'react';

import { AppRoutes, LOCATION_ZOOM } from '../../../universal/config';
import { IconClose, IconHome } from '../../assets/icons';
import Heading from '../Heading/Heading';
import { HomeIconMarker } from './MaMarker';
import { IS_MAPS_ENABLED } from '../../../universal/env';
import Linkd from '../Button/Button';
import { ReactComponent as Logo } from '../../assets/images/logo-amsterdam.svg';
import { MaMap } from './MaMap';
import { MaZoomControl } from './MaZoomControl';
import classnames from 'classnames';
import styles from './MyArea.module.scss';

export function MyAreaHeader() {
  return (
    <div className={styles.Header}>
      <Link
        className={styles.LogoLink}
        to={AppRoutes.ROOT}
        title="Terug naar home"
      >
        <Logo
          role="img"
          aria-label="Gemeente Amsterdam logo"
          className={styles.Logo}
        />
        <h1 className={styles.Title}>Mijn buurt</h1>
      </Link>
      <Linkd iconPosition="right" icon={IconClose} href={AppRoutes.ROOT}>
        Sluit kaart
      </Linkd>
    </div>
  );
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

function MyAreaMapContainer({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={classnames(styles.MyAreaMapContainer, className)}>
      {children}
    </div>
  );
}

interface MyAreaMapIframeProps {
  url?: string;
  className?: string;
}

export function MyAreaMapIFrame({ url, className }: MyAreaMapIframeProps) {
  return (
    <MyAreaMapContainer className={className}>
      {!!url && IS_MAPS_ENABLED ? (
        <iframe
          id="mapIframe"
          title="Kaart van mijn buurt"
          src={url}
          className={styles.MyAreaMapIFrame}
        />
      ) : (
        <MyAreaLoader />
      )}
    </MyAreaMapContainer>
  );
}

interface MyAreaMapComponentProps {
  id?: string;
  title?: string;
  center?: LatLngObject | null;
  homeAddress?: string;
  options?: MapDisplayOptions;
  className?: string;
}

export default function MyAreaMap({
  center,
  title = 'Kaart van Mijn buurt',
  id = 'map',
  homeAddress,
  options = DEFAULT_MAP_DISPLAY_CONFIG,
  className,
}: MyAreaMapComponentProps) {
  return (
    <MyAreaMapContainer className={className}>
      {!!center && IS_MAPS_ENABLED ? (
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

interface MyAreaDashboardComponentProps extends HTMLProps<HTMLDivElement> {
  center?: LatLngObject | null;
  url?: string;
}

export function MyAreaDashboard({
  center,
  url,
  ...otherProps
}: MyAreaDashboardComponentProps) {
  return (
    <div {...otherProps} className={styles.MapDashboard}>
      {IS_MY_AREA_2_ENABLED && (
        <MyAreaMap
          center={center}
          options={{ zoomTools: false, zoom: LOCATION_ZOOM }}
        />
      )}
      {!IS_MY_AREA_2_ENABLED && <MyAreaMapIFrame url={url} />}
      <NavLink to={AppRoutes.BUURT} className={styles.MapDashboardOverlay}>
        <div>
          <Heading size="large">Mijn buurt</Heading>
          <p>
            Klik voor een overzicht van gemeentelijke informatie rond uw eigen
            woning.
          </p>
        </div>
      </NavLink>
    </div>
  );
}
