import { useDesktopScreen, usePhoneScreen } from '../../hooks/media.hook';

import { ReactComponent as AmsterdamLogo } from '../../assets/images/logo-amsterdam.svg';
import { ReactComponent as AmsterdamLogoLarge } from '../../assets/images/logo-amsterdam-large.svg';
import { AppRoutes } from '../../../universal/config';
import ErrorMessages from '../ErrorMessages/ErrorMessages';
import Heading from '../Heading/Heading';
import { Link } from 'react-router-dom';
import Linkd from '../Button/Button';
import MainHeaderHero from '../MainHeaderHero/MainHeaderHero';
import MainNavBar from '../MainNavBar/MainNavBar';
import React, { useMemo } from 'react';
import styles from './MainHeader.module.scss';
import { useLocation } from 'react-router-dom';
import { getApiErrors } from '../../config/api';
import { useAppStateGetter } from '../../hooks/useAppState';

export interface MainHeaderProps {
  isAuthenticated?: boolean;
}

export default function MainHeader({
  isAuthenticated = false,
}: MainHeaderProps) {
  const isHeroVisible = true;
  const appState = useAppStateGetter();
  const errors = useMemo(() => getApiErrors(appState), [appState]);
  const Logo = useDesktopScreen() ? AmsterdamLogoLarge : AmsterdamLogo;
  const hasErrors = !!errors.length;
  const location = useLocation();

  return (
    <header className={styles.header}>
      {!usePhoneScreen() && (
        <nav className={styles.DirectSkipLinks}>
          <Linkd external={true} tabIndex={0} href="#skip-to-id-AppContent">
            Direct naar: <b>Pagina inhoud</b>
          </Linkd>
          <Linkd external={true} tabIndex={0} href="#skip-to-id-MainFooter">
            Direct naar: <b>Footer</b>
          </Linkd>
        </nav>
      )}
      <div className={styles.topBar}>
        <span className={styles.logoLink}>
          <a
            href={'https://www.amsterdam.nl'}
            rel="external noreferrer noopener"
          >
            <Logo
              role="img"
              aria-label="Gemeente Amsterdam logo"
              className={styles.logo}
            />
          </a>
          {location.pathname !== AppRoutes.ROOT ? (
            <Heading size="large" el="h1">
              <Link to={AppRoutes.ROOT} title="Terug naar home">
                Mijn Amsterdam
              </Link>
            </Heading>
          ) : (
            <Heading size="large" el="h1">
              Mijn Amsterdam
            </Heading>
          )}
        </span>
      </div>
      {isAuthenticated && <MainNavBar />}
      {isAuthenticated && hasErrors && (
        <ErrorMessages errors={errors} className={styles.ErrorMessages} />
      )}
      {isHeroVisible && <MainHeaderHero />}
    </header>
  );
}
