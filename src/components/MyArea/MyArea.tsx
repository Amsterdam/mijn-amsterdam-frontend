import { AppRoutes } from 'config/Routing.constants';
import { ReactComponent as CloseIcon } from 'assets/icons/Close.svg';
import { ReactComponent as Logo } from 'assets/images/logo-amsterdam.svg';
import iconUrl, { ReactComponent as HomeIcon } from 'assets/icons/home.svg';
import { ReactComponent as HomeIconSimple } from 'assets/icons/home-simple.svg';
import Heading from 'components/Heading/Heading';
import React, {
  HTMLProps,
  useEffect,
  useState,
  useRef,
  Ref,
  PropsWithChildren,
} from 'react';
import { Link, NavLink } from 'react-router-dom';

import styles from './MyArea.module.scss';
import Linkd from 'components/Button/Button';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Map, TileLayer, Marker, useMapInstance } from '@datapunt/react-maps';

import { LOCATION_ZOOM, DEFAULT_ZOOM } from '../../config/Map.constants';
import classnames from 'classnames';

import {
  DEFAULT_MAP_OPTIONS,
  DEFAULT_TILE_LAYER_CONFIG,
  Centroid,
} from 'config/Map.constants';

const MaPopup = React.forwardRef(
  ({ children }: any, ref: Ref<HTMLDivElement>) => {
    return <div ref={ref}>{children}</div>;
  }
);
MaPopup.displayName = 'Popup';

const MaTooltip = React.forwardRef(
  ({ children }: any, ref: Ref<HTMLDivElement>) => {
    return <div ref={ref}>{children}</div>;
  }
);
MaTooltip.displayName = 'Tooltip';

function firstChildOfType(children: any, childType: any) {
  return Array.isArray(children)
    ? children.find(child => child && child.type === childType)
    : children && children.type === childType
    ? children
    : null;
}

function useBindToMarker(component: any, markerInstance: any) {
  const componentRef = useRef();
  let name = '';
  if (component) {
    component = React.cloneElement(component, {
      ref: componentRef,
    });
    name = component.type.displayName;
  }
  useEffect(() => {
    if (componentRef.current && markerInstance) {
      // Use the name of the child component to complete the bind method call.
      // For example passing a Popup component will result in bindPopup(ref.current)
      markerInstance['bind' + name](componentRef.current);
    }
  }, [componentRef, markerInstance, name]);

  return component;
}

function MaMarker({ children, center, iconUrl }: any) {
  const [markerInstance, setMarkerInstance] = useState();
  let popup = useBindToMarker(
    firstChildOfType(children, MaPopup),
    markerInstance
  );
  let tooltip = useBindToMarker(
    firstChildOfType(children, MaTooltip),
    markerInstance
  );
  const icon = L.icon({
    iconUrl,
    iconRetinaUrl: iconUrl,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, 0],
  });

  return (
    <>
      <Marker
        setInstance={setMarkerInstance}
        options={{ icon }}
        args={[center]}
      />
      {popup}
      {tooltip}
    </>
  );
}

interface HomeIconMarkerProps {
  center: Centroid;
  address?: string;
}

function HomeIconMarker({ center, address }: HomeIconMarkerProps) {
  const mapInstance = useMapInstance();

  useEffect(() => {
    if (center && mapInstance) {
      mapInstance.setView(center, DEFAULT_ZOOM);
    }
  }, [center, mapInstance]);

  return (
    <MaMarker iconUrl={iconUrl} center={center}>
      {!!address && <MaTooltip>{address}</MaTooltip>}
    </MaMarker>
  );
}

interface ZoomControlComponentProps {
  center: Centroid;
  homeZoom?: number;
}

type WithChildren<T> = Omit<HTMLProps<T>, 'type'>;

type ZoomButtonProps = WithChildren<HTMLButtonElement>;

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

function ZoomControl({
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

type MapDisplayComponentProps = PropsWithChildren<{
  center: Centroid;
  id: string;
  title: string;
}>;

function MapDisplay({ children, id, title, center }: MapDisplayComponentProps) {
  return (
    <Map
      id={id}
      aria-label={title}
      style={{ width: '100%', height: '100%' }}
      options={{ ...DEFAULT_MAP_OPTIONS, center }}
    >
      <TileLayer
        options={{
          ...DEFAULT_TILE_LAYER_CONFIG.options,
        }}
        args={[DEFAULT_TILE_LAYER_CONFIG.url]}
      />
      {children}
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

function MyAreaMapContainer({ children }: PropsWithChildren<{}>) {
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
  homeAddress?: string;
}

export function MyAreaMap({
  center,
  title = 'Kaart van Mijn buurt',
  id = 'map',
  homeAddress,
}: MyAreaMapComponentProps) {
  return (
    <MyAreaMapContainer>
      {!!center ? (
        <MapDisplay title={title} id={id} center={center}>
          <HomeIconMarker center={center} address={homeAddress} />
          <ZoomControl center={center} />
        </MapDisplay>
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
