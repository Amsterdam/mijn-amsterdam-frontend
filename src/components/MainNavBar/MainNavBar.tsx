import { AppRoutes, Colors, LOGOUT_URL, Chapters } from 'App.constants';
import { ComponentChildren } from 'App.types';
import { AppContext, SessionContext } from 'AppState';
import { ReactComponent as LogoutIcon } from 'assets/icons/Logout.svg';
import classnames from 'classnames';
import FontEnlarger from 'components/FontEnlarger/FontEnlarger';
import MainNavSubmenu, {
  MainNavSubmenuLink,
} from 'components/MainNavSubmenu/MainNavSubmenu';
import { getFullName } from 'data-formatting/brp';
import { useDesktopScreen, useTabletScreen } from 'hooks/media.hook';
import { trackItemPresentation } from 'hooks/analytics.hook';
import React, { useContext, useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import useRouter from 'use-react-router';

import LoadingContent from '../LoadingContent/LoadingContent';
import {
  mainMenuItemId,
  MenuItem,
  menuItems,
  submenuItems,
} from './MainNavBar.constants';
import styles from './MainNavBar.module.scss';
import Tutorial from 'components/Tutorial/Tutorial';
import { Button } from 'components/Button/Button';
import Linkd from '../Button/Button';
import { useSpring, animated } from 'react-spring';

const BurgerMenuToggleBtnId = 'BurgerMenuToggleBtn';
const LinkContainerId = 'MainMenu';

export interface MainNavLinkProps {
  to: string;
  children: ComponentChildren;
  title: string;
  onFocus?: () => void;
  onMouseEnter?: () => void;
}

function SecondaryLinks() {
  const {
    BRP: {
      data: { persoon },
      isError,
    },
  } = useContext(AppContext);

  const hasFirstName = !!(persoon && persoon.voornamen);

  useEffect(() => {
    if (hasFirstName) {
      trackItemPresentation('Mijn gegevens', 'Link naar Profiel');
    }
  }, [hasFirstName]);

  const isDesktopScreen = useDesktopScreen();

  return (
    <div className={styles.secondaryLinks}>
      {isDesktopScreen && <FontEnlarger />}
      {!isError && (
        <Link
          to={AppRoutes.PROFILE}
          className={styles.ProfileLink}
          data-tutorial-item="Hier kunt u uw algemene persoonsgegevens uit de gemeentelijke basisregistratie raadplegen, zoals uw woonadres;left-bottom"
          id="ProfileLink"
        >
          {persoon && persoon.voornamen ? (
            getFullName(persoon)
          ) : (
            <LoadingContent barConfig={[['15rem', '1rem', '0']]} />
          )}
        </Link>
      )}
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

function getMenuItem(
  item: MenuItem,
  activeSubmenuId: string,
  setSubMenuVisibility: (id?: string, isSubmenuTrigger?: boolean) => void,
  useInteractionHandlers: boolean = true
) {
  if (Array.isArray(item.submenuItems)) {
    const isOpen = activeSubmenuId === item.id;

    return (
      <MainNavSubmenu
        key={item.id}
        title={item.title}
        isOpen={isOpen}
        onFocus={() => !isOpen && setSubMenuVisibility(item.id)}
        onClick={(event: Event) => event.preventDefault()} // Prevent chrome from closing the submenu by triggering focus handler on click
        onMouseEnter={() => setSubMenuVisibility(item.id)}
        onMouseLeave={() => setSubMenuVisibility()}
      >
        {item.submenuItems.map(({ id, to, Icon, title, rel }) => {
          return (
            <MainNavSubmenuLink
              key={id}
              to={to}
              rel={rel}
              onFocus={() => setSubMenuVisibility(item.id, true)}
            >
              {Icon && (
                <span className={styles.SubmenuItemIcon}>
                  <Icon aria-label={id} fill={Colors.neutralGrey4} />
                </span>
              )}
              <span className={styles.SubmenuItemTitle}>{title}</span>
            </MainNavSubmenuLink>
          );
        })}
      </MainNavSubmenu>
    );
  }

  const interactionHandlers = useInteractionHandlers
    ? {
        onFocus: () => setSubMenuVisibility(item.id),
        onMouseEnter: () => setSubMenuVisibility(item.id),
      }
    : {};

  return (
    <MainNavLink
      key={item.id}
      to={item.to}
      {...interactionHandlers}
      title={item.title}
    >
      {item.title}
    </MainNavLink>
  );
}

export default function MainNavBar() {
  const [activeSubmenuId, activateSubmenu] = useState('');
  const {
    MY_CHAPTERS: { items: myChapterItems },
  } = useContext(AppContext);
  const { isAuthenticated } = useContext(SessionContext);
  const hasBurgerMenu = useTabletScreen();
  const [isBurgerMenuVisible, toggleBurgerMenu] = useState<boolean | undefined>(
    undefined
  );
  const { history, location } = useRouter();
  const [isTutorialVisible, setIsTutorialVisible] = useState(false);

  function closeBurgerMenu(e?: any) {
    if (isBurgerMenuVisible) {
      // Testing for clicks on elements that are not part of the responsive menu
      const BurgerMenuToggleButton = document.getElementById(
        BurgerMenuToggleBtnId
      );
      const LinkContainer = document.getElementById(LinkContainerId);
      const clickedOutside = !(
        (LinkContainer && LinkContainer.contains(e.target)) ||
        (BurgerMenuToggleButton && BurgerMenuToggleButton.contains(e.target))
      );

      if (clickedOutside) {
        toggleBurgerMenu(false);
      }
    }
  }

  function setSubMenuVisibility(
    id?: string,
    isSubmenuTrigger: boolean = false
  ) {
    if (id && activeSubmenuId !== id) {
      activateSubmenu(id);
    } else if (!isSubmenuTrigger && activeSubmenuId !== id) {
      activateSubmenu('');
    }
  }

  // Bind click outside small screen menu to hide it
  useEffect(() => {
    document.addEventListener('click', closeBurgerMenu);
    return () => document.removeEventListener('click', closeBurgerMenu);
  });

  // Hides small screen menu on route change
  useEffect(() => {
    toggleBurgerMenu(false);
    setSubMenuVisibility();
  }, [history.location]);

  const linkContainerAnim = {
    immediate: isBurgerMenuVisible === undefined,
    reverse: isBurgerMenuVisible,
    left: -400,
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

  return (
    <nav
      className={classnames(
        styles.MainNavBar,
        hasBurgerMenu && styles.BurgerMenu,
        isBurgerMenuVisible && styles.BurgerMenuVisible
      )}
    >
      {hasBurgerMenu && (
        <button
          id={BurgerMenuToggleBtnId}
          className={classnames(
            styles.BurgerMenuToggleBtn,
            isBurgerMenuVisible && styles.BurgerMenuToggleBtnOpen
          )}
          onClick={() => toggleBurgerMenu(!isBurgerMenuVisible)}
        >
          Navigatie
        </button>
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
            <SecondaryLinks />
            {menuItems.map(item => {
              let menuItem = item;
              if (item.id in submenuItems) {
                // Add dynamic chapter submenu items to the menu
                if (item.id === mainMenuItemId.MY_CHAPTERS) {
                  menuItem = { ...item, submenuItems: myChapterItems };
                } else {
                  menuItem = { ...item, submenuItems: submenuItems[item.id] };
                }
              }
              return getMenuItem(
                menuItem,
                activeSubmenuId,
                setSubMenuVisibility,
                !hasBurgerMenu
              );
            })}
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
