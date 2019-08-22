import { AppRoutes, errorMessageMap, excludedApiKeys } from 'App.constants';
import { AppContext } from 'AppState';
import { ReactComponent as BetaLabel } from 'assets/images/beta-label.svg';
import { ReactComponent as AmsterdamLogoLarge } from 'assets/images/logo-amsterdam-large.svg';
import { ReactComponent as AmsterdamLogo } from 'assets/images/logo-amsterdam.svg';
import ErrorMessages from 'components/ErrorMessages/ErrorMessages';
import Heading from 'components/Heading/Heading';
import MainHeaderHero from 'components/MainHeaderHero/MainHeaderHero';
import MainNavBar from 'components/MainNavBar/MainNavBar';
import { entries } from 'helpers/App';
import { useDesktopScreen } from 'hooks/media.hook';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import styles from './MainHeader.module.scss';

export interface MainHeaderProps {
  isAuthenticated?: boolean;
}

export default function MainHeader({
  isAuthenticated = false,
}: MainHeaderProps) {
  const isHeroVisible = true;
  const appState = useContext(AppContext);
  const errors = entries(appState)
    .filter(
      ([stateKey, state]) =>
        !excludedApiKeys.includes(stateKey) &&
        'isError' in state &&
        state.isError
    )
    .map(
      ([stateKey]) =>
        errorMessageMap[stateKey] || {
          name: stateKey,
          error: 'Communicatie met api mislukt.',
        }
    );

  const hasErrors = !!errors.length;
  const Logo = useDesktopScreen() ? AmsterdamLogoLarge : AmsterdamLogo;

  return (
    <header className={styles.header}>
      <nav className={styles.DirectSkipLinks}>
        <a
          tabIndex={0}
          href="#AppContent"
          className="action-button secondary line-only"
        >
          Direct naar: <b>Pagina inhoud</b>
        </a>
        <a
          tabIndex={0}
          href="#MainFooter"
          className="action-button secondary line-only"
        >
          Direct naar: <b>Footer</b>
        </a>
      </nav>
      <div className={styles.topBar}>
        <Link
          className={styles.logoLink}
          to={AppRoutes.ROOT}
          aria-label="Terug naar home"
        >
          <Logo
            aria-hidden="true"
            role="img"
            aria-label="Amsterdam logo"
            className={styles.logo}
          />

          <Heading size="large" el="h1">
            Mijn Amsterdam
          </Heading>
        </Link>
        <BetaLabel
          aria-hidden="true"
          role="img"
          aria-label="Beta versie"
          className={styles.betaLabel}
        />
      </div>
      {isAuthenticated && <MainNavBar />}
      {hasErrors && (
        <ErrorMessages errors={errors} className={styles.ErrorMessages} />
      )}
      {isHeroVisible && <MainHeaderHero />}
    </header>
  );
}
