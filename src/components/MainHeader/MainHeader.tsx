import { AppRoutes, ExternalUrls, LOGOUT_URL, Layout } from 'App.constants';
import { ReactComponent as BetaLabel } from 'assets/images/beta-label.svg';
import { ReactComponent as AmsterdamLogoLarge } from 'assets/images/logo-amsterdam-large.svg';
import classnames from 'classnames';
import MainHeaderHero from 'components/MainHeaderHero/MainHeaderHero';
import MainNavBar from 'components/MainNavBar/MainNavBar';
import React, { useState, useEffect } from 'react';
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
  const MenuWrapperId = 'MenuWrapper';
  const MenuToggleBtnId = 'MenuToggleBtn';
  const { history } = useRouter();

  /**
   * Close the responsive menu on outside menu click, if the menu is open
   */
  function closeRespMenuOnOutsideMenuClick(e: any) {
    // If the menu is open, check if the user clicked outside of the menu
    if (responsiveMenuIsVisible) {
      const clickedOutside = !(
        document.getElementById(MenuWrapperId)!.contains(e.target) ||
        document.getElementById(MenuToggleBtnId)!.contains(e.target)
      );

      // If so, close the menu
      if (clickedOutside) {
        toggleResponsiveMenu(false);
      }
    }
  }

  /**
   * Add a listener to close the responsive menu if the user clicks outside
   * of the menu
   */
  useEffect(() => {
    document.addEventListener('click', closeRespMenuOnOutsideMenuClick);
    // Return the clean up function
    return () =>
      document.removeEventListener('click', closeRespMenuOnOutsideMenuClick);
  });

  /**
   * Listen to history changes and close the responsive menu on change
   */
  useEffect(() => {
    history.listen(() => toggleResponsiveMenu(false));
  });
  return (
    <header className={styles.header}>
      <div className={styles.topBar}>
        <span className={styles.logoLink}>
          <AmsterdamLogoLarge
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
    </header>
  );
}
