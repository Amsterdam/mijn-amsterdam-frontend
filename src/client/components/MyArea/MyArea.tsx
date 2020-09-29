import classnames from 'classnames';
import React, { HTMLProps, PropsWithChildren } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config';
import { getOtapEnvItem } from '../../../universal/config/env';
import { IconClose, IconHome } from '../../assets/icons';
import { ReactComponent as Logo } from '../../assets/images/logo-amsterdam.svg';
import Linkd from '../Button/Button';
import Heading from '../Heading/Heading';
import styles from './MyArea.module.scss';
import { Adres } from '../../../universal/types';
import { getFullAddress } from '../../../universal/helpers';
import { useProfileTypeValue } from '../../hooks/useProfileType';

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
      {!!url && getOtapEnvItem('isMyAreaMapEnabled') ? (
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

interface MyAreaDashboardComponentProps extends HTMLProps<HTMLDivElement> {
  center?: LatLngObject | null;
  url?: string;
  address?: Adres | null;
}

export function MyAreaDashboard({
  center,
  url,
  address,
  ...otherProps
}: MyAreaDashboardComponentProps) {
  const profileType = useProfileTypeValue();
  return (
    <div {...otherProps} className={styles.MapDashboard}>
      {getOtapEnvItem('isMyAreaMapEnabled') && <MyAreaMapIFrame url={url} />}
      <NavLink to={AppRoutes.BUURT} className={styles.MapDashboardOverlay}>
        <div>
          <Heading size="large">Mijn buurt</Heading>
          {address && <p>{getFullAddress(address)}</p>}
          <p>
            Klik voor een overzicht van gemeentelijke informatie rond uw{' '}
            {profileType === 'private' ? 'eigen woning' : 'bedrijf'}.
          </p>
        </div>
      </NavLink>
    </div>
  );
}
