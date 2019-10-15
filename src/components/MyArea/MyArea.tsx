import { AppRoutes } from 'App.constants';
import { ReactComponent as CloseIcon } from 'assets/icons/Close.svg';
import { ReactComponent as Logo } from 'assets/images/logo-amsterdam.svg';
import { ReactComponent as HomeIcon } from 'assets/icons/home.svg';
import Heading from 'components/Heading/Heading';
import React from 'react';
import { Link, NavLink } from 'react-router-dom';

import styles from './MyArea.module.scss';

export function MyAreaHeader() {
  return (
    <div className={styles.Header}>
      <Link to={AppRoutes.ROOT} aria-label="Terug naar home">
        <Logo
          aria-hidden="true"
          role="img"
          aria-label="Amsterdam logo"
          className={styles.Logo}
        />
      </Link>
      <h1 className={styles.Title}>Mijn buurt</h1>
      <NavLink to={AppRoutes.ROOT} className={styles.CloseBtn}>
        <span>Sluit kaart</span>
        <CloseIcon aria-hidden="true" className={styles.CloseIcon} />
      </NavLink>
    </div>
  );
}

interface MyAreaMapComponentProps {
  url: string;
}

export function MyAreaMap({ url }: MyAreaMapComponentProps) {
  return !!url ? (
    <iframe
      id="mapIframe"
      title="Kaart van mijn buurt"
      src={url}
      className={styles.Map}
    />
  ) : (
    <div className={styles.loadingText}>
      <span className={styles.HomeLoader}>
        <HomeIcon aria-hidden="true" />
        Uw adres wordt opgezocht...
      </span>
    </div>
  );
}

interface MyAreaComponentProps {
  url: string;
}

export default function MyArea({ url }: MyAreaComponentProps) {
  return (
    <div className={styles.MyArea}>
      <MyAreaMap url={url} />
      <NavLink to={AppRoutes.MY_AREA} className={styles.Overlay}>
        <div>
          <Heading
            id="MyAreaHeader" // Used for tutorial placement
            size="large"
          >
            Mijn buurt
          </Heading>
          <p>
            Klik voor een overzicht van gemeentelijke informatie rond uw eigen
            woning.
          </p>
        </div>
      </NavLink>
    </div>
  );
}
