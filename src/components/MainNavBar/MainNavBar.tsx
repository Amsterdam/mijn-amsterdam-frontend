import { AppRoutes, Colors, Layout, LOGOUT_URL } from 'App.constants';
import { ComponentChildren } from 'App.types';
import { AppContext, SessionContext } from 'AppState';
import { ReactComponent as LogoutIcon } from 'assets/icons/Logout.svg';
import classnames from 'classnames';
import { IconButtonLink } from 'components/ButtonLink/ButtonLink';
import FontEnlarger from 'components/FontEnlarger/FontEnlarger';
import MainNavSubmenu, {
  MainNavSubmenuLink,
} from 'components/MainNavSubmenu/MainNavSubmenu';
import { getFullName } from 'data-formatting/brp';
import { useDesktopScreen, useTabletScreen } from 'hooks/media.hook';
import {
  itemClickPayload,
  itemInteractionPayload,
  trackEvent,
  trackItemPresentation,
} from 'hooks/analytics.hook';
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
import teststyles from 'components/Tutorial/Tutorial.module.scss';

const MenuToggleBtnId = 'MenuToggleBtn';
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
    BRP: { persoon, isError },
  } = useContext(AppContext);

  const hasFirstName = !!(persoon && persoon.voornamen);

  useEffect(() => {
    if (hasFirstName) {
      trackItemPresentation('MA_Header/Secundaire_Links', 'Link_naar_Profiel');
    }
  }, [hasFirstName]);
  const isDesktopScreen = useDesktopScreen();

  return (
    <div className={styles.secondaryLinks}>
      {isDesktopScreen && <FontEnlarger />}
      {!isError && (
        <Link
          to={AppRoutes.PROFILE}
          data-track={itemClickPayload(
            'MA_Header/Secundaire_Links',
            'Link_naar_Profiel'
          )}
        >
          {persoon && persoon.voornamen ? (
            getFullName(persoon)
          ) : (
            <LoadingContent barConfig={[['15rem', '1rem', '0']]} />
          )}
        </Link>
      )}
      {
        <IconButtonLink
          to={LOGOUT_URL}
          rel="external"
          data-track={itemClickPayload(
            'MA_Header/Secundaire_Links',
            'Link_naar_Uitloggen'
          )}
        >
          <LogoutIcon aria-hidden="true" /> Uitloggen
        </IconButtonLink>
      }
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
              data-track={itemClickPayload(
                'MA_Header/Primaire_Links/Mijn_Themas_submenu',
                `Link_naar_${id}`
              )}
              onFocus={() => setSubMenuVisibility(item.id, true)}
            >
              {Icon && <Icon fill={Colors.neutralGrey4} aria-hidden="true" />}
              {title}
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
      data-track={itemClickPayload(
        'MA_Header/Primaire_Links',
        `Link_naar_${item.id}`
      )}
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
  const isResponsiveMenu = useTabletScreen();
  const [isResponsiveMenuMenuVisible, toggleResponsiveMenu] = useState(false);
  const { history } = useRouter();
  const [isTutorialVisible, toggleTutorial] = useState(false);
  const TUTORIAL_CLASS = teststyles.TutorialItems;

  useEffect(() => {
    const classList = document.body.classList;
    isTutorialVisible
      ? classList.add(TUTORIAL_CLASS)
      : classList.remove(TUTORIAL_CLASS);
  }, [isTutorialVisible]);

  function closeResponsiveMenu(e?: any) {
    if (isResponsiveMenuMenuVisible) {
      // Testing for clicks on elements that are not part of the responsive menu
      const MenuToggleButton = document.getElementById(MenuToggleBtnId);
      const LinkContainer = document.getElementById(LinkContainerId);
      const clickedOutside = !(
        (LinkContainer && LinkContainer.contains(e.target)) ||
        (MenuToggleButton && MenuToggleButton.contains(e.target))
      );

      if (clickedOutside) {
        toggleResponsiveMenu(false);
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
    document.addEventListener('click', closeResponsiveMenu);
    return () => document.removeEventListener('click', closeResponsiveMenu);
  });

  // Hides small screen menu on route change
  useEffect(() => {
    toggleResponsiveMenu(false);
    setSubMenuVisibility();
  }, [history.location]);

  return (
    <nav className={styles.MainNavBar}>
      {isResponsiveMenu && (
        <button
          id={MenuToggleBtnId}
          className={classnames(styles.MenuToggleBtn, {
            [styles.MenuToggleBtnOpen]: isResponsiveMenuMenuVisible,
          })}
          onClick={() => toggleResponsiveMenu(!isResponsiveMenuMenuVisible)}
        >
          Navigatie
        </button>
      )}

      {isAuthenticated && (!isResponsiveMenu || isResponsiveMenuMenuVisible) && (
        <div id={LinkContainerId} className={styles.LinkContainer}>
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
              !isResponsiveMenu
            );
          })}
        </div>
      )}

      <button
        className={classnames(styles.TutorialBtn, {
          [styles.TutorialBtnOpen]: isTutorialVisible,
        })}
        onClick={() => {
          toggleTutorial(!isTutorialVisible);
        }}
      />
      {isTutorialVisible && <Tutorial toggleTutorial={toggleTutorial} />}

      {isResponsiveMenuMenuVisible && (
        <div
          style={{
            height:
              document.body.scrollHeight -
              Layout.mainHeaderTopbarHeight -
              Layout.mainHeaderNavbarHeight,
          }}
          className={styles.Modal}
        />
      )}
    </nav>
  );
}
