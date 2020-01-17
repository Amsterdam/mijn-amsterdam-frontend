import { AppRoutes } from 'config/App.constants';
import { ReactComponent as CloseIcon } from 'assets/icons/Close.svg';
import { ReactComponent as Logo } from 'assets/images/logo-amsterdam.svg';
import { ReactComponent as HomeIcon } from 'assets/icons/home.svg';
import Heading from 'components/Heading/Heading';
import React from 'react';
import { Link, NavLink } from 'react-router-dom';

import styles from './MyArea.module.scss';
import Linkd from 'components/Button/Button';

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

interface MyAreaMapComponentProps {
  url: string;
}

export function MyAreaMap({ url }: MyAreaMapComponentProps) {
  return !!url ? (
    <iframe
      id="mapIframe"
      title="Kaart van mijn buurt"
      src={url}
      className={styles.MapContainer}
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

export default function MyArea({ url, ...otherProps }: MyAreaComponentProps) {
  return (
    <div {...otherProps} className={styles.MyArea}>
      <MyAreaMap url={url} />
      <NavLink to={AppRoutes.MY_AREA} className={styles.Overlay}>
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
