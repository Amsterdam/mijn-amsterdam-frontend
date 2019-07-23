import { AppRoutes } from 'App.constants';
import { ReactComponent as CloseIcon } from 'assets/icons/Close.svg';
import { ReactComponent as Logo } from 'assets/images/logo-amsterdam.svg';
import { ReactComponent as HomeIcon } from 'assets/icons/home.svg';
import Heading from 'components/Heading/Heading';
import { itemClickPayload, trackItemPresentation } from 'hooks/analytics.hook';
import React, { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';

import styles from './MyArea.module.scss';

interface MyAreaHeaderComponentProps {
  trackCategory: string;
}

export function MyAreaHeader({ trackCategory }: MyAreaHeaderComponentProps) {
  return (
    <div className={styles.Header}>
      <Link to={AppRoutes.ROOT}>
        <Logo className={styles.Logo} />
      </Link>
      <h1 className={styles.Title}>Mijn buurt</h1>
      <NavLink
        to={AppRoutes.ROOT}
        className={styles.CloseBtn}
        data-track={itemClickPayload(trackCategory, 'Link_Sluit_kaart')}
      >
        <span>Sluit kaart</span>
        <CloseIcon className={styles.CloseIcon} />
      </NavLink>
    </div>
  );
}

interface MyAreaMapComponentProps {
  trackCategory: string;
  url: string;
}

export function MyAreaMap({ trackCategory, url }: MyAreaMapComponentProps) {
  useEffect(() => {
    trackItemPresentation(trackCategory, 'Embed_kaart');
  }, []);
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
        <HomeIcon />
        Uw adres wordt opgezocht...
      </span>
    </div>
  );
}

interface MyAreaComponentProps {
  trackCategory: string;
  url: string;
}

export default function MyArea({ trackCategory, url }: MyAreaComponentProps) {
  return (
    <div className={styles.MyArea}>
      <MyAreaMap trackCategory={trackCategory} url={url} />
      <NavLink
        to={AppRoutes.MY_AREA}
        className={styles.Overlay}
        data-track={itemClickPayload(
          trackCategory,
          'KaartLink_naar_Detail_Pagina'
        )}
      >
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
