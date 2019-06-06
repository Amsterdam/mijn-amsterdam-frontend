import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './MyArea.module.scss';
import { MAP_URL } from './MyArea.constants';
import { AppRoutes } from 'App.constants';
import { ReactComponent as Logo } from 'assets/images/logo-amsterdam.svg';
import { ReactComponent as CloseIcon } from 'assets/icons/Close.svg';
import Heading from 'components/Heading/Heading';

export function MyAreaHeader() {
  return (
    <div className={styles.Header}>
      <Logo />
      <h1 className={styles.Title}>Mijn Buurt</h1>
      <NavLink to={AppRoutes.ROOT} className={styles.CloseBtn}>
        Sluit kaart
        <CloseIcon />
      </NavLink>
    </div>
  );
}

export function MyAreaMap() {
  return (
    <iframe
      id="mapIframe"
      title="Kaart van mijn buurt"
      src={MAP_URL}
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
