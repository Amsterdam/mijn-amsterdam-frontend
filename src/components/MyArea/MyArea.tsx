import { AppRoutes } from 'App.constants';
import { ReactComponent as CloseIcon } from 'assets/icons/Close.svg';
import { ReactComponent as Logo } from 'assets/images/logo-amsterdam.svg';
import Heading from 'components/Heading/Heading';
import { itemClickPayload, trackItemPresentation } from 'hooks/piwik.hook';
import React, { useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import styles from './MyArea.module.scss';
import useMyMap from 'hooks/api/api.mymap';

interface MyAreaHeaderComponentProps {
  trackCategory: string;
}

export function MyAreaHeader({ trackCategory }: MyAreaHeaderComponentProps) {
  return (
    <div className={styles.Header}>
      <Link to={AppRoutes.ROOT}>
        <Logo className={styles.Logo} />
      </Link>
      <h1 className={styles.Title}>Mijn Buurt</h1>
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
  address?: string;
  simpleMap?: boolean;
}

export function MyAreaMap({
  trackCategory,
  address,
  simpleMap = false,
}: MyAreaMapComponentProps) {
  useEffect(() => {
    trackItemPresentation(
      trackCategory,
      'Embed_kaart' + simpleMap ? '_simpel' : '_volledig'
    );
  }, []);

  const { url, isDirty, isLoading } = useMyMap(address, simpleMap);

  return isDirty && !isLoading ? (
    <iframe
      id="mapIframe"
      title="Kaart van mijn buurt"
      src={url}
      className={styles.Map}
    />
  ) : (
    <span>Kaart wordt geladen..</span>
  );
}

interface MyAreaComponentProps {
  trackCategory: string;
  simpleMap?: boolean;
  address?: string;
}

export default function MyArea({
  trackCategory,
  simpleMap = false,
  address,
}: MyAreaComponentProps) {
  if (!address) {
    return null;
  }
  return (
    <div className={styles.MyArea}>
      <MyAreaMap
        trackCategory={trackCategory}
        simpleMap={simpleMap}
        address={address}
      />
      <NavLink
        to={AppRoutes.MY_AREA}
        className={styles.Overlay}
        data-track={itemClickPayload(
          trackCategory,
          'KaartLink_naar_Detail_Pagina'
        )}
      >
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
