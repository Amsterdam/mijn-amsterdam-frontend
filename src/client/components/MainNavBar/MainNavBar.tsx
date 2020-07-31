import classnames from 'classnames';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { animated } from 'react-spring';
import { AppRoutes } from '../../../universal/config';
import { ComponentChildren } from '../../../universal/types';
import { IconInfo } from '../../assets/icons';
import { ChapterIcons } from '../../config/chapterIcons';
import { trackItemPresentation } from '../../hooks/analytics.hook';
import { useSessionValue } from '../../hooks/api/useSessionApi';
import { useDesktopScreen, useTabletScreen } from '../../hooks/media.hook';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useChapterMenuItems } from '../../hooks/useChapters';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import Linkd, { Button } from '../Button/Button';
import FontEnlarger from '../FontEnlarger/FontEnlarger';
import LogoutLink from '../LogoutLink/LogoutLink';
import MainNavSubmenu, {
  MainNavSubmenuLink,
} from '../MainNavSubmenu/MainNavSubmenu';
import Tutorial from '../Tutorial/Tutorial';
import {
  mainMenuItemId,
  mainMenuItems,
  MenuItem,
} from './MainNavBar.constants';
import styles from './MainNavBar.module.scss';
import { ProfileName } from './ProfileName';
import { useBurgerMenuAnimation } from './useBurgerMenuAnimation';
import { isError } from '../../../universal/helpers/api';

const BurgerMenuToggleBtnId = 'BurgerMenuToggleBtn';
const LinkContainerId = 'MainMenu';

export interface MainNavLinkProps {
  to: string;
  children: ComponentChildren;
  title: string;
}

function SecondaryLinks() {
  const { BRP, KVK } = useAppStateGetter();
  const persoon = BRP.content?.persoon || null;
  const hasFirstName = !!(persoon && persoon.voornamen);
  const isDesktopScreen = useDesktopScreen();
  const profileType = useProfileTypeValue();

  useEffect(() => {
    if (hasFirstName) {
      trackItemPresentation('Mijn gegevens', 'Link naar Profiel');
    }
  }, [hasFirstName]);

  return (
    <div className={styles.secondaryLinks}>
      {isDesktopScreen && <FontEnlarger />}
      {!isError(BRP) && !isError(KVK) && (
        <ProfileName
          person={BRP.content?.persoon}
          company={KVK.content}
          profileType={profileType}
        />
      )}
      <LogoutLink>Uitloggen</LogoutLink>
    </div>
  );
}

function MainNavLink({ children, to, title, ...rest }: MainNavLinkProps) {
  return (
    <NavLink to={to} className={styles.MainNavLink} {...rest}>
      <span>{children}</span>
    </NavLink>
  );
}

function getMenuItem(item: MenuItem) {
  if (Array.isArray(item.submenuItems)) {
    return (
      <MainNavSubmenu key={item.id} title={item.title} id={item.id}>
        {item.submenuItems.map(({ id, to, title, rel }) => {
          return (
            <MainNavSubmenuLink
              key={id}
              className={styles.MainNavSubmenuLink}
              title={title}
              to={to}
              rel={rel}
              Icon={ChapterIcons[id]}
              data-chapter-id={id}
            />
          );
        })}
      </MainNavSubmenu>
    );
  }

  return (
    <MainNavLink key={item.id} to={item.to} title={item.title}>
      {item.title}
    </MainNavLink>
  );
}

interface BurgerButtonProps {
  isActive: boolean;
  toggleBurgerMenu: (isActive: boolean) => void;
}

function BurgerButton({ isActive, toggleBurgerMenu }: BurgerButtonProps) {
  return (
    <button
      id={BurgerMenuToggleBtnId}
      className={classnames(
        styles.BurgerMenuToggleBtn,
        isActive && styles.BurgerMenuToggleBtnOpen
      )}
      onClick={() => toggleBurgerMenu(!isActive)}
    >
      Navigatie
    </button>
  );
}

export default function MainNavBar() {
  const session = useSessionValue();
  const hasBurgerMenu = useTabletScreen();
  const [isBurgerMenuVisible, toggleBurgerMenu] = useState<boolean | undefined>(
    undefined
  );
  const myChapterItems = useChapterMenuItems();
  const location = useLocation();
  const [isTutorialVisible, setIsTutorialVisible] = useState(false);

  const onClickOutsideBurgermenu = useCallback(
    (event?: any) => {
      if (isBurgerMenuVisible) {
        // Testing for clicks on elements that are not part of the responsive menu
        const BurgerMenuToggleButton = document.getElementById(
          BurgerMenuToggleBtnId
        );
        const LinkContainer = document.getElementById(LinkContainerId);
        const clickedOutside = !(
          (LinkContainer && LinkContainer.contains(event.target)) ||
          (BurgerMenuToggleButton &&
            BurgerMenuToggleButton.contains(event.target))
        );

        if (clickedOutside) {
          toggleBurgerMenu(false);
        }
      }
    },
    [isBurgerMenuVisible]
  );

  // Bind click outside small screen menu to hide it
  useEffect(() => {
    document.addEventListener('click', onClickOutsideBurgermenu);
    return () =>
      document.removeEventListener('click', onClickOutsideBurgermenu);
  }, [onClickOutsideBurgermenu]);

  // Hides small screen menu on route change
  useEffect(() => {
    toggleBurgerMenu(false);
  }, [location.pathname]);

  const {
    linkContainerAnimationProps,
    backdropAnimationProps,
    leftProps,
  } = useBurgerMenuAnimation(isBurgerMenuVisible);

  const menuItemsComposed = useMemo(() => {
    return mainMenuItems.map(item => {
      let menuItem = item;

      // Add dynamic chapter submenu items to the menu
      if (item.id === mainMenuItemId.CHAPTERS) {
        menuItem = { ...item, submenuItems: myChapterItems };
      }

      return getMenuItem(menuItem);
    });
  }, [myChapterItems]);

  return (
    <nav
      className={classnames(
        styles.MainNavBar,
        hasBurgerMenu && styles.BurgerMenu,
        isBurgerMenuVisible && styles.BurgerMenuVisible
      )}
    >
      {hasBurgerMenu && (
        <BurgerButton
          isActive={!!isBurgerMenuVisible}
          toggleBurgerMenu={toggleBurgerMenu}
        />
      )}

      {session.isAuthenticated && (
        <>
          {hasBurgerMenu && (
            <animated.div
              key="BurgerMenuBackDrop"
              style={{ ...leftProps, ...backdropAnimationProps }}
              className={styles.Backdrop}
            />
          )}
          <animated.div
            key="LinkContainer"
            id={LinkContainerId}
            className={styles.LinkContainer}
            style={linkContainerAnimationProps}
          >
            {menuItemsComposed}
            <SecondaryLinks />
          </animated.div>
        </>
      )}

      <div
        className={classnames(
          styles.InfoButtons,
          isTutorialVisible && styles.InfoButtonsOpen
        )}
      >
        {location.pathname === AppRoutes.ROOT && (
          <>
            <Button
              className={styles.TutorialBtn}
              onClick={() => {
                setIsTutorialVisible(!isTutorialVisible);
              }}
              variant="plain"
              aria-expanded={isTutorialVisible}
              lean={true}
            >
              Rondleiding
            </Button>
            {isTutorialVisible && (
              <Tutorial
                onClose={() => setIsTutorialVisible(!isTutorialVisible)}
              />
            )}
          </>
        )}
        <Linkd
          className={styles.GeneralInfoLink}
          href={AppRoutes.GENERAL_INFO}
          variant="plain"
          icon={IconInfo}
          lean={true}
        />
      </div>
    </nav>
  );
}
