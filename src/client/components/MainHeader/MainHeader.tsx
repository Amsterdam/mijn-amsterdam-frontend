import { Heading } from '@amsterdam/design-system-react';
import classnames from 'classnames';
import { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppRoutes, OTAP_ENV } from '../../../universal/config';
import AmsterdamLogoLarge from '../../assets/images/logo-amsterdam-large.svg?react';
import AmsterdamLogo from '../../assets/images/logo-amsterdam.svg?react';
import { getApiErrors } from '../../config/api';
import { useDesktopScreen, usePhoneScreen } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppState';
import Linkd from '../Button/Button';
import ErrorMessages from '../ErrorMessages/ErrorMessages';
import MainHeaderHero from '../MainHeaderHero/MainHeaderHero';
import MainNavBar from '../MainNavBar/MainNavBar';
import styles from './MainHeader.module.scss';

export interface MainHeaderProps {
  isAuthenticated?: boolean;
  isHeroVisible?: boolean;
}

function OtapLabel() {
  return ['test', 'development', 'acceptance'].includes(OTAP_ENV) ? (
    <small
      className={classnames(
        styles['otap-env'],
        styles[`otap-env--${OTAP_ENV}`]
      )}
    >
      {OTAP_ENV}
    </small>
  ) : null;
}

export default function MainHeader({
  isAuthenticated = false,
  isHeroVisible = true,
}: MainHeaderProps) {
  const appState = useAppStateGetter();
  const errors = useMemo(() => getApiErrors(appState), [appState]);
  const Logo = useDesktopScreen() ? AmsterdamLogoLarge : AmsterdamLogo;
  const hasErrors = !!errors.length;
  const location = useLocation();
  const isPhonescreen = usePhoneScreen();

  return (
    <header className={styles.header}>
      {!isPhonescreen && (
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
          <a href="https://www.amsterdam.nl" rel="external noreferrer noopener">
            <Logo
              role="img"
              aria-label="Gemeente Amsterdam logo"
              className={styles.logo}
            />
          </a>
          {location.pathname !== AppRoutes.ROOT ? (
            <Heading level={2} size="level-1" key="heading-back">
              <Link to={AppRoutes.ROOT} title="Terug naar home">
                Mijn Amsterdam <OtapLabel />
              </Link>
            </Heading>
          ) : (
            <Heading level={2} size="level-1" key="heading-home">
              Mijn Amsterdam <OtapLabel />
            </Heading>
          )}
        </span>
      </div>
      {isAuthenticated && <MainNavBar isAuthenticated={isAuthenticated} />}
      {isAuthenticated && hasErrors && (
        <ErrorMessages errors={errors} className={styles.ErrorMessages} />
      )}
      {isHeroVisible && <MainHeaderHero />}
    </header>
  );
}
