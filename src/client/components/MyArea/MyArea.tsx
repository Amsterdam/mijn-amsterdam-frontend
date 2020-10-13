import classnames from 'classnames';
import React, { HTMLProps, PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { getOtapEnvItem } from '../../../universal/config/env';
import { Adres } from '../../../universal/types';
import { IconHome, IconHomeCommercial } from '../../assets/icons';
import { Colors } from '../../config/app';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { useTermReplacement } from '../../hooks/useTermReplacement';
import Heading from '../Heading/Heading';
import styles from './MyArea.module.scss';
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
  const termReplace = useTermReplacement();
  return (
    <div {...otherProps} className={styles.MapDashboard}>
      {getOtapEnvItem('isMyAreaMapEnabled') && <MyAreaMapIFrame url={url} />}
      {getOtapEnvItem('isMyArea2MapEnabled') && (
        <MyArea2Loader isDashboard={true} />
      )}
      <NavLink to={AppRoutes.BUURT} className={styles.MapDashboardOverlay}>
        <div>
          <Heading size="large">{termReplace(ChapterTitles.BUURT)}</Heading>
          <p>
            Klik voor een overzicht van gemeentelijke informatie rond uw{' '}
            {termReplace('eigen woning')}.
          </p>
        </div>
      </NavLink>
    </div>
  );
}
