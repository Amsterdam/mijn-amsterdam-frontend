import { AppRoutes, ExternalUrls, LOGOUT_URL, Layout, ApiUrls } from 'App.constants';
import { ReactComponent as BetaLabel } from 'assets/images/beta-label.svg';
import { ReactComponent as AmsterdamLogoLarge } from 'assets/images/logo-amsterdam-large.svg';
import { ReactComponent as AmsterdamLogo } from 'assets/images/logo-amsterdam.svg';
import classnames from 'classnames';
import MainHeaderHero from 'components/MainHeaderHero/MainHeaderHero';
import MainNavBar from 'components/MainNavBar/MainNavBar';
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { ReactComponent as LogoutIcon } from 'assets/icons/Logout.svg';
import classNames from 'classnames';
import styles from './MainHeader.module.scss';

import {
  ButtonLinkExternal,
  IconButtonLink,
} from 'components/ButtonLink/ButtonLink';
import Heading from 'components/Heading/Heading';
import { Person } from 'data-formatting/brp';
import useRouter from 'use-react-router';
import { useLargeScreen } from 'hooks/media.hook';

const MenuWrapperId = 'MenuWrapper';
const MenuToggleBtnId = 'MenuToggleBtn';
import ErrorMessages from 'components/ErrorMessages/ErrorMessages';

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
            className={classNames(styles.MenuToggleBtn, {
              [styles.MenuToggleBtnOpen]: responsiveMenuIsVisible,
            })}
            onClick={() => toggleResponsiveMenu(!responsiveMenuIsVisible)}
          />
          <div
            id={MenuWrapperId}
            className={classNames(styles.MenuWrapper, {
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
            className={classNames(styles.Modal, {
              [styles.ModalOpen]: responsiveMenuIsVisible,
            })}
          />
        </div>
      )}
      <MainHeaderHero />
      <ErrorMessages className={styles.ErrorMessages} />
    </header>
  );
}
