import { AppRoutes, errorMessageMap, excludedApiKeys } from 'App.constants';
import { AppContext } from 'AppState';
import { ReactComponent as BetaLabel } from 'assets/images/beta-label.svg';
import { ReactComponent as AmsterdamLogoLarge } from 'assets/images/logo-amsterdam-large.svg';
import { ReactComponent as AmsterdamLogo } from 'assets/images/logo-amsterdam.svg';
import ErrorMessages from 'components/ErrorMessages/ErrorMessages';
import Heading from 'components/Heading/Heading';
import MainHeaderHero from 'components/MainHeaderHero/MainHeaderHero';
import MainNavBar from 'components/MainNavBar/MainNavBar';
import { Person } from 'data-formatting/brp';
import { entries } from 'helpers/App';
import { useDesktopScreen } from 'hooks/media.hook';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import styles from './MainHeader.module.scss';
import FontEnlarger from 'components/FontEnlarger/FontEnlarger';

export interface MainHeaderProps {
  person?: Person | null;
  isAuthenticated?: boolean;
}

export default function MainHeader({
  person = null,
  isAuthenticated = false,
}: MainHeaderProps) {
  // TODO: TBD if hero should not show up on mobile.
  // const isHeroVisible = !usePhoneScreen();
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
      <div className={styles.topBar}>
        <Link className={styles.logoLink} to={AppRoutes.ROOT}>
          <Logo
            role="img"
            aria-label="Amsterdam logo"
            className={styles.logo}
          />
        </Link>
        <Heading size="large" el="h1">
          <Link className={styles.logoLink} to={AppRoutes.ROOT}>
            Mijn Amsterdam
          </Link>
        </Heading>
        <FontEnlarger />
        <BetaLabel
          role="img"
          aria-label="Beta versie"
          className={styles.betaLabel}
        />
      </div>
      {isAuthenticated && <MainNavBar person={person} />}
      {hasErrors && (
        <ErrorMessages errors={errors} className={styles.ErrorMessages} />
      )}
      {isHeroVisible && <MainHeaderHero />}
    </header>
  );
}
