import { AppRoutes, errorMessageMap } from 'App.constants';
import { AppContext, StateKey } from 'AppState';
import { ReactComponent as BetaLabel } from 'assets/images/beta-label.svg';
import { ReactComponent as AmsterdamLogoLarge } from 'assets/images/logo-amsterdam-large.svg';
import { ReactComponent as AmsterdamLogo } from 'assets/images/logo-amsterdam.svg';
import ErrorMessages from 'components/ErrorMessages/ErrorMessages';
import Heading from 'components/Heading/Heading';
import MainHeaderHero from 'components/MainHeaderHero/MainHeaderHero';
import MainNavBar from 'components/MainNavBar/MainNavBar';
import { entries } from 'helpers/App';
import { useDesktopScreen, usePhoneScreen } from 'hooks/media.hook';
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import styles from './MainHeader.module.scss';
import Linkd from 'components/Button/Button';
import useRouter from 'use-react-router';

const excludedApiKeys: StateKey[] = ['MY_CHAPTERS', 'SESSION'];

export interface MainHeaderProps {
  isAuthenticated?: boolean;
}

function TheHeading() {
  const Logo = useDesktopScreen() ? AmsterdamLogoLarge : AmsterdamLogo;
  return (
    <>
      <Logo
        role="img"
        aria-label="Gemeente Amsterdam logo"
        className={styles.logo}
      />
      <Heading size="large" el="h1">
        Mijn Amsterdam
      </Heading>
    </>
  );
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
  const { location } = useRouter();

  return (
    <header className={styles.header}>
      {!usePhoneScreen() && (
        <nav className={styles.DirectSkipLinks}>
          <Linkd external={true} tabIndex={0} href="#AppContent">
            Direct naar: <b>Pagina inhoud</b>
          </Linkd>
          <Linkd external={true} tabIndex={0} href="#MainFooter">
            Direct naar: <b>Footer</b>
          </Linkd>
        </nav>
      )}
      <div className={styles.topBar}>
        {location.pathname !== AppRoutes.ROOT ? (
          <Link
            className={styles.logoLink}
            to={AppRoutes.ROOT}
            title="Terug naar home"
          >
            <TheHeading />
          </Link>
        ) : (
          <span className={styles.logoLink}>
            <TheHeading />
          </span>
        )}
        <div className={styles.betaLabel}>
          <BetaLabel role="img" aria-label="Beta" />
        </div>
      </div>
      {isAuthenticated && <MainNavBar />}
      {hasErrors && (
        <ErrorMessages errors={errors} className={styles.ErrorMessages} />
      )}
      {isHeroVisible && <MainHeaderHero />}
    </header>
  );
}
