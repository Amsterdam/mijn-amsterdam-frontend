import { useDesktopScreen, usePhoneScreen } from '../../hooks/media.hook';

import { ReactComponent as AmsterdamLogo } from '../../assets/images/logo-amsterdam.svg';
import { ReactComponent as AmsterdamLogoLarge } from '../../assets/images/logo-amsterdam-large.svg';
import { AppRoutes } from '../../../universal/config';
import { ReactComponent as BetaLabel } from '../../assets/images/beta-label.svg';
import ErrorMessages from '../ErrorMessages/ErrorMessages';
import Heading from '../Heading/Heading';
import { Link } from 'react-router-dom';
import Linkd from '../Button/Button';
import MainHeaderHero from '../MainHeaderHero/MainHeaderHero';
import MainNavBar from '../MainNavBar/MainNavBar';
import React from 'react';
import styles from './MainHeader.module.scss';
import useRouter from 'use-react-router';

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
  const errors: any[] = [];
  // const appState = useContext(AppContext);
  // const errors = entries(appState)
  //   .filter(([stateKey, state]) => {
  //     return (
  //       !excludedApiKeys.includes(stateKey) &&
  //       'isError' in state &&
  //       state.isError
  //     );
  //   })
  //   .map(([stateKey, state]) => {
  //     const name = ErrorNames[stateKey] || stateKey;
  //     return {
  //       name,
  //       error:
  //         ('errorMessage' in state ? state.errorMessage : null) ||
  //         'Communicatie met api mislukt.',
  //     };
  //   });

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
