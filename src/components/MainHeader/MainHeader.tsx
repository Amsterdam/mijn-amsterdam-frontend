import {
  AppRoutes,
  errorMessageMap,
  excludedApiKeys,
  ExternalUrls,
  Layout,
  LOGOUT_URL,
} from 'App.constants';
import { AppContext } from 'AppState';
import { ReactComponent as LogoutIcon } from 'assets/icons/Logout.svg';
import { ReactComponent as BetaLabel } from 'assets/images/beta-label.svg';
import { ReactComponent as AmsterdamLogoLarge } from 'assets/images/logo-amsterdam-large.svg';
import { ReactComponent as AmsterdamLogo } from 'assets/images/logo-amsterdam.svg';
import classnames from 'classnames';
import {
  ButtonLinkExternal,
  IconButtonLink,
} from 'components/ButtonLink/ButtonLink';
import ErrorMessages from 'components/ErrorMessages/ErrorMessages';
import Heading from 'components/Heading/Heading';
import MainHeaderHero from 'components/MainHeaderHero/MainHeaderHero';
import MainNavBar from 'components/MainNavBar/MainNavBar';
import { Person } from 'data-formatting/brp';
import { entries } from 'helpers/App';
import { useLargeScreen, useSmallScreen } from 'hooks/media.hook';
import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useRouter from 'use-react-router';

import styles from './MainHeader.module.scss';

const MenuWrapperId = 'MenuWrapper';
const MenuToggleBtnId = 'MenuToggleBtn';

interface SecondaryLinksProps {
  person: Person | null;
  hasMessages?: boolean;
}

function SecondaryLinks({ person, hasMessages = false }: SecondaryLinksProps) {
  return (
    <nav className={styles.secondaryLinks}>
      <ButtonLinkExternal
        to={ExternalUrls.BERICHTENBOX}
        className={classnames(hasMessages && 'has-messages')}
      >
        Berichtenbox
      </ButtonLinkExternal>
      {person && person.firstName && (
        <Link to={AppRoutes.PROFILE}>{person.fullName}</Link>
      )}
      {
        <IconButtonLink target="_self" to={LOGOUT_URL}>
          <LogoutIcon /> Uitloggen
        </IconButtonLink>
      }
    </nav>
  );
}

export interface MainHeaderProps {
  person?: Person | null;
  isAuthenticated?: boolean;
}

export default function MainHeader({
  person = null,
  isAuthenticated = false,
}: MainHeaderProps) {
  const [responsiveMenuIsVisible, toggleResponsiveMenu] = useState(false);
  const { history } = useRouter();
  const isHeroVisible = !useSmallScreen();
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

  function closeResponsiveMenu(e: any) {
    if (responsiveMenuIsVisible) {
      // Testing for elements that are not part of the responsive menu
      const clickedOutside = !(
        document.getElementById(MenuWrapperId)!.contains(e.target) ||
        document.getElementById(MenuToggleBtnId)!.contains(e.target)
      );

      if (clickedOutside) {
        toggleResponsiveMenu(false);
      }
    }
  }

  useEffect(() => {
    document.addEventListener('click', closeResponsiveMenu);
    return () => document.removeEventListener('click', closeResponsiveMenu);
  });

  useEffect(() => {
    toggleResponsiveMenu(false);
  }, [history.location]);

  const Logo = useLargeScreen() ? AmsterdamLogoLarge : AmsterdamLogo;

  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <span className={styles.logoLink}>
          <Logo
            role="img"
            aria-label="Amsterdam logo"
            className={styles.logo}
          />
          <Heading size="large" el="h1">
            <Link className={styles.logoLink} to={AppRoutes.ROOT}>
              Mijn Amsterdam
            </Link>
          </Heading>
        </span>
        <BetaLabel
          role="img"
          aria-label="Beta versie"
          className={styles.betaLabel}
        />
      </div>
      {isAuthenticated && (
        <div className={styles.MenuContainer}>
          <button
            id={MenuToggleBtnId}
            className={classnames(styles.MenuToggleBtn, {
              [styles.MenuToggleBtnOpen]: responsiveMenuIsVisible,
            })}
            onClick={() => toggleResponsiveMenu(!responsiveMenuIsVisible)}
          />
          <div
            id={MenuWrapperId}
            className={classnames(styles.MenuWrapper, {
              [styles.MenuWrapperOpen]: responsiveMenuIsVisible,
            })}
          >
            <MainNavBar />
            <SecondaryLinks person={person} />
          </div>
          <div
            style={{
              height:
                document.body.scrollHeight -
                Layout.mainHeaderTopbarHeight -
                Layout.mainHeaderNavbarHeight,
            }}
            className={classnames(styles.Modal, {
              [styles.ModalOpen]: responsiveMenuIsVisible,
            })}
          />
        </div>
      )}
      {isHeroVisible && <MainHeaderHero />}
      {hasErrors && (
        <ErrorMessages errors={errors} className={styles.ErrorMessages} />
      )}
    </header>
  );
}
