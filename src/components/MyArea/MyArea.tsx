import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import styles from './MyArea.module.scss';
import { MAP_URL } from './MyArea.constants';
import { AppRoutes } from 'App.constants';
import { ReactComponent as Logo } from 'assets/images/logo-amsterdam.svg';
import { ReactComponent as CloseIcon } from 'assets/icons/Close.svg';
import Heading from 'components/Heading/Heading';
import { itemClickPayload } from 'hooks/piwik.hook';
import { trackItemPresentation } from 'hooks/piwik.hook';

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
}

export function MyAreaMap({ trackCategory }: MyAreaMapComponentProps) {
  useEffect(() => {
    trackItemPresentation(trackCategory, 'Embed_kaart');
  }, []);
  return (
    <iframe
      id="mapIframe"
      title="Kaart van mijn buurt"
      src={MAP_URL}
      className={styles.Map}
    />
  );
}

interface MyAreaComponentProps {
  trackCategory: string;
}

export default function MyArea({ trackCategory }: MyAreaComponentProps) {
  return (
    <div className={styles.MyArea}>
      <MyAreaMap trackCategory={trackCategory} />
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
