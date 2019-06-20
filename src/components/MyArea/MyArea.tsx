import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import styles from './MyArea.module.scss';
import {
  MAP_URL,
  DEFAULT_LON,
  DEFAULT_LAT,
  DEFAULT_ZOOM,
} from './MyArea.constants';
import { AppRoutes } from 'App.constants';
import { ReactComponent as Logo } from 'assets/images/logo-amsterdam.svg';
import { ReactComponent as CloseIcon } from 'assets/icons/Close.svg';
import Heading from 'components/Heading/Heading';
import { useDataApi } from '../../hooks/api/api.hook';

export function MyAreaHeader() {
  return (
    <div className={styles.Header}>
      <Link to={AppRoutes.ROOT}>
        <Logo className={styles.Logo} />
      </Link>
      <h1 className={styles.Title}>Mijn Buurt</h1>
      <NavLink to={AppRoutes.ROOT} className={styles.CloseBtn}>
        <span>Sluit kaart</span>
        <CloseIcon className={styles.CloseIcon} />
      </NavLink>
    </div>
  );
}

export function MyAreaMap() {
  const address = 'Weesperstraat 113';
  const [{ data }] = useDataApi({
    url: `https://api.data.amsterdam.nl/atlas/search/adres/?q=${address}`,
  });

  let url = `${MAP_URL}&center=${DEFAULT_LON}%2C${DEFAULT_LAT}&zoom=${DEFAULT_ZOOM}`;

  if (data.results && data.results.length) {
    const {
      results: [
        {
          centroid: [lat, lon],
        },
      ],
    } = data;
    url = `${MAP_URL}&center=${lon}%2C${lat}&zoom=${13}`;
  }

  return (
    <iframe
      id="mapIframe"
      title="Kaart van mijn buurt"
      src={url}
      className={styles.Map}
    />
  );
}

export default function MyArea() {
  return (
    <div className={styles.MyArea}>
      <MyAreaMap />
      <NavLink to={AppRoutes.MY_AREA} className={styles.Overlay}>
        <div>
          <Heading size="large">Mijn Buurt</Heading>
          <p>
            Klik voor een overzicht van gemeentelijke informatie rond uw eigen
            woning
          </p>
        </div>
      </NavLink>
    </div>
  );
}
