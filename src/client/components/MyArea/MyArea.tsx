import classnames from 'classnames';
import React, { HTMLProps, PropsWithChildren } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config';
import { getOtapEnvItem } from '../../../universal/config/env';
import { IconHome } from '../../assets/icons';
import Heading from '../Heading/Heading';
import styles from './MyArea.module.scss';
import MyArea2MapDashboard from './MyArea2Dashboard';
import { MyArea2Loader } from './MyArea2loader';

function MyAreaLoader() {
  const profileType = useProfileTypeValue();
  return (
    <div className={styles.MyAreaLoader}>
      <span>
        {profileType === 'private' ? (
          <IconHome aria-hidden="true" />
        ) : (
          <IconHomeCommercial fill={Colors.primaryRed} aria-hidden="true" />
        )}
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
      {getOtapEnvItem('isMyArea2MapEnabled') && (
        <MyArea2Loader isDashboard={true} />
      )}
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
