import classnames from 'classnames';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { Link, NavLink } from 'react-router-dom';
import { animated, useSpring } from 'react-spring';
import useRouter from 'use-react-router';
import { AppRoutes, LOGOUT_URL } from '../../../universal/config';
import { getMyChapters, isLoading } from '../../../universal/helpers';
import { ComponentChildren } from '../../../universal/types/App.types';
import { AppContext } from '../../AppState';
import { ReactComponent as LogoutIcon } from '../../assets/icons/Logout.svg';
import { ChapterIcons } from '../../config/chapterIcons';
import { MenuItem } from '../../config/menuItems';
import { trackItemPresentation } from '../../hooks/analytics.hook';
import { useDesktopScreen, useTabletScreen } from '../../hooks/media.hook';
import { getFullName } from '../../pages/Profile/formatData';
import { SessionContext } from '../../SessionState';
import Linkd, { Button } from '../Button/Button';
import FontEnlarger from '../FontEnlarger/FontEnlarger';
import LoadingContent from '../LoadingContent/LoadingContent';
import MainNavSubmenu, {
  MainNavSubmenuLink,
} from '../MainNavSubmenu/MainNavSubmenu';
import Tutorial from '../Tutorial/Tutorial';
import {
  mainMenuItemId,
  mainMenuItems,
  submenuItems,
} from './MainNavBar.constants';
import styles from './MainNavBar.module.scss';

const BurgerMenuToggleBtnId = 'BurgerMenuToggleBtn';
const LinkContainerId = 'MainMenu';

export interface MainNavLinkProps {
  to: string;
  children: ComponentChildren;
  title: string;
}

function SecondaryLinks() {
  const { BRP } = useContext(AppContext);
  const persoon = BRP?.status === 'OK' ? BRP.content.persoon : null;
  const hasFirstName = !!(persoon && persoon.voornamen);
  const isDesktopScreen = useDesktopScreen();

  useEffect(() => {
    if (hasFirstName) {
      trackItemPresentation('Mijn gegevens', 'Link naar Profiel');
    }
  }, [hasFirstName]);

  return (
    <div className={styles.secondaryLinks}>
      {isDesktopScreen && <FontEnlarger />}

      <Link
        to={AppRoutes.MIJN_GEGEVENS}
        className={styles.ProfileLink}
        data-tutorial-item="Hier kunt u uw algemene persoonsgegevens uit de gemeentelijke basisregistratie raadplegen, zoals uw woonadres;left-bottom"
      >
        {isLoading(BRP) ? (
          <LoadingContent barConfig={[['15rem', '1rem', '0']]} />
        ) : persoon?.opgemaakteNaam ? (
          getFullName(persoon)
        ) : (
          'mijn gegevens'
        )}
      </Link>

      <Linkd
        href={LOGOUT_URL}
        external={true}
        lean={true}
        className={styles.LogoutLink}
        icon={LogoutIcon}
      >
        Uitloggen
      </Linkd>
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
        {item.submenuItems.map(({ id, to, title, rel, chapter }) => {
          return (
            <MainNavSubmenuLink
              key={id}
              className={styles.MainNavSubmenuLink}
              title={title}
              to={to}
              rel={rel}
              Icon={chapter ? ChapterIcons[chapter] : undefined}
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

function useBurgerMenuAnimation(isBurgerMenuVisible: boolean | undefined) {
  const config = {
    mass: 0.3,
    tension: 400,
  };

  const linkContainerAnim = {
    immediate: isBurgerMenuVisible === undefined,
    reverse: isBurgerMenuVisible,
    left: -400,
    config,
    from: {
      left: 0,
    },
  };

  const backdropAnim = {
    immediate: isBurgerMenuVisible === undefined,
    reverse: isBurgerMenuVisible,
    opacity: 0,
    from: {
      opacity: 1,
    },
  };

  const left: any = {
    immediate: isBurgerMenuVisible !== false,
    reverse: !isBurgerMenuVisible,
    left: 0,
    config,
    from: {
      left: -1000,
    },
  };

  if (!isBurgerMenuVisible) {
    left.delay = 300;
  }

  const linkContainerAnimationProps = useSpring(linkContainerAnim);
  const backdropAnimationProps = useSpring(backdropAnim);
  const leftProps = useSpring(left);

  return {
    linkContainerAnimationProps,
    backdropAnimationProps,
    leftProps,
  };
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
  const appState = useContext(AppContext);
  const session = useContext(SessionContext);
  const { isAuthenticated } = session;
  const hasBurgerMenu = useTabletScreen();
  const [isBurgerMenuVisible, toggleBurgerMenu] = useState<boolean | undefined>(
    undefined
  );
  const { items: myChapterItems } = getMyChapters(appState);

  const { history, location } = useRouter();
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
  }, [history.location]);

  const {
    linkContainerAnimationProps,
    backdropAnimationProps,
    leftProps,
  } = useBurgerMenuAnimation(isBurgerMenuVisible);

  const menuItemsComposed = useMemo(() => {
    return mainMenuItems.map(item => {
      let menuItem = item;
      if (item.id in submenuItems) {
        // Add dynamic chapter submenu items to the menu
        if (item.id === mainMenuItemId.CHAPTERS) {
          menuItem = { ...item, submenuItems: myChapterItems };
        } else {
          menuItem = {
            ...item,
            submenuItems: submenuItems[item.id],
          };
        }
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

      {isAuthenticated && (
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

      {location.pathname === AppRoutes.ROOT && (
        <>
          <Button
            className={classnames(
              styles.TutorialBtn,
              isTutorialVisible && styles.TutorialBtnOpen
            )}
            onClick={() => {
              setIsTutorialVisible(!isTutorialVisible);
            }}
            variant="plain"
            aria-expanded={isTutorialVisible}
            lean={true}
          >
            Uitleg
          </Button>
          {isTutorialVisible && (
            <Tutorial
              onClose={() => setIsTutorialVisible(!isTutorialVisible)}
            />
          )}
        </>
      )}
    </nav>
  );
}
