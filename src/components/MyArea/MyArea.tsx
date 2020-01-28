import { AppRoutes } from 'config/Routing.constants';
import { ReactComponent as CloseIcon } from 'assets/icons/Close.svg';
import { ReactComponent as Logo } from 'assets/images/logo-amsterdam.svg';
import iconUrl, { ReactComponent as HomeIcon } from 'assets/icons/home.svg';
import { ReactComponent as HomeIconSimple } from 'assets/icons/home-simple.svg';
import Heading from 'components/Heading/Heading';
import React, { HTMLProps, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

import styles from './MyArea.module.scss';
import Linkd from 'components/Button/Button';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Map, TileLayer, Marker, useMapInstance } from '@datapunt/react-maps';

import { ComponentChildren } from 'App.types';
import { LOCATION_ZOOM, DEFAULT_ZOOM } from '../../config/Map.constants';

import {
  DEFAULT_MAP_OPTIONS,
  DEFAULT_TILE_LAYER_CONFIG,
  Centroid,
} from 'config/Map.constants';

interface MapDisplayComponentProps {
  center: Centroid;
  id: string;
  title: string;
}

interface HomeIconMarkerProps {
  center: Centroid;
}

function HomeIconMarker({ center }: HomeIconMarkerProps) {
  const mapInstance = useMapInstance();

  useEffect(() => {
    if (center && mapInstance) {
      mapInstance.setView(center, DEFAULT_ZOOM);
    }
  }, [center, mapInstance]);

  return (
    <Marker
      options={{
        icon: L.icon({
          iconUrl,
          iconRetinaUrl: iconUrl,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
          popupAnchor: [1, -34],
          tooltipAnchor: [16, -28],
        }),
      }}
      args={[center]}
    />
  );
}

interface ZoomControlComponentProps {
  center: Centroid;
}

function ZoomControl({ center }: ZoomControlComponentProps) {
  const mapInstance = useMapInstance();
  return (
    <div className={styles.ZoomControl}>
      <button
        onClick={() =>
          mapInstance && mapInstance.setView(center, LOCATION_ZOOM)
        }
        className={styles.HomeButton}
      >
        <HomeIconSimple fill="#000" />
      </button>
      <button
        onClick={() => mapInstance && mapInstance.zoomIn()}
        className={styles.ZoomInButton}
      >
        &#43;
      </button>
      <button
        onClick={() => mapInstance && mapInstance.zoomOut()}
        className={styles.ZoomOutButton}
      >
        &minus;
      </button>
    </div>
  );
}

function MapDisplay({ center, id, title }: MapDisplayComponentProps) {
  return (
    <Map
      id={id}
      title={title}
      style={{ width: '100%', height: '100%' }}
      events={{
        zoomend: () => {
          // eslint-disable-next-line no-console
          console.log('zoomend');
        },
        click: () => {
          // eslint-disable-next-line no-console
          console.log('click');
        },
      }}
      options={{ ...DEFAULT_MAP_OPTIONS, center }}
    >
      <TileLayer
        options={{
          attribution:
            '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
          ...DEFAULT_TILE_LAYER_CONFIG.options,
        }}
        args={[DEFAULT_TILE_LAYER_CONFIG.url]}
      />
      <HomeIconMarker center={center} />
      <ZoomControl center={center} />
    </Map>
  );
}

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
      <Linkd iconPosition="right" icon={CloseIcon} href={AppRoutes.ROOT}>
        Sluit kaart
      </Linkd>
    </div>
  );
}

function MyAreaLoader() {
  return (
    <div className={styles.MyAreaLoader}>
      <span>
        <HomeIcon aria-hidden="true" />
        Uw adres wordt opgezocht...
      </span>
    </div>
  );
}

interface MyAreaMapContainerProps {
  children: ComponentChildren;
}

function MyAreaMapContainer({ children }: MyAreaMapContainerProps) {
  return <div className={styles.MyAreaMapContainer}>{children}</div>;
}

interface MyAreaMapIframeProps {
  url?: string;
}

export function MyAreaMapIFrame({ url }: MyAreaMapIframeProps) {
  return (
    <MyAreaMapContainer>
      {!!url ? (
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
  center?: Centroid;
}

export function MyAreaMap({
  center,
  title = 'Kaart van Mijn buurt',
  id = 'map',
}: MyAreaMapComponentProps) {
  return (
    <MyAreaMapContainer>
      {!!center ? (
        <MapDisplay title={title} id={id} center={center} />
      ) : (
        <MyAreaLoader />
      )}
    </MyAreaMapContainer>
  );
}

interface MyAreaDashboardComponentProps extends HTMLProps<HTMLDivElement> {
  center?: Centroid;
  url?: string;
}

export function MyAreaDashboard({
  center,
  url,
  ...otherProps
}: MyAreaDashboardComponentProps) {
  return (
    <div {...otherProps} className={styles.MyArea}>
      {!!center && <MyAreaMap center={center} />}
      {!!url && <MyAreaMapIFrame url={url} />}
      <NavLink to={AppRoutes.MIJN_BUURT} className={styles.MapDashboardOverlay}>
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
