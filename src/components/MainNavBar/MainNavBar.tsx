import React, { useState, useContext, useEffect } from 'react';
import MainNavSubmenu, {
  MainNavSubmenuLink,
} from 'components/MainNavSubmenu/MainNavSubmenu';
import { NavLink, Link } from 'react-router-dom';
import { AppContext } from 'AppState';
import {
  menuItems,
  MenuItem,
  mainMenuItemId,
  submenuItems,
} from './MainNavBar.constants';
import styles from './MainNavBar.module.scss';
import {
  Colors,
  AppRoutes,
  LOGOUT_URL,
  ExternalUrls,
  Layout,
} from 'App.constants';
import { ComponentChildren } from 'App.types';
import {
  ButtonLinkExternal,
  IconButtonLink,
} from 'components/ButtonLink/ButtonLink';
import { ReactComponent as LogoutIcon } from 'assets/icons/Logout.svg';
import { useTabletScreen } from 'hooks/media.hook';
import useRouter from 'use-react-router';
import classnames from 'classnames';
import { Person } from 'data-formatting/brp';

const MenuToggleBtnId = 'MenuToggleBtn';
const LinkContainerId = 'MainMenu';

export interface MainNavLinkProps {
  to: string;
  children: ComponentChildren;
  title: string;
  onFocus?: () => void;
  onMouseEnter?: () => void;
}

interface SecondaryLinksProps {
  person: Person | null;
  hasMessages?: boolean;
}

type MainNavBarProps = SecondaryLinksProps;

function SecondaryLinks({ person, hasMessages = false }: SecondaryLinksProps) {
  return (
    <div className={styles.secondaryLinks}>
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
  setSubMenuVisibility: (id?: string, isSubmenuTrigger?: boolean) => void
) {
  if (Array.isArray(item.submenuItems)) {
    const isOpen = activeSubmenuId === item.id;

    return (
      <MainNavSubmenu
        key={item.id}
        id={item.id}
        title={item.title}
        isOpen={isOpen}
        onFocus={() => !isOpen && setSubMenuVisibility(item.id)}
        onClick={(event: Event) => event.preventDefault()} // Prevent chrome from closing the submenu by triggering focus handler on click
        onMouseEnter={() => setSubMenuVisibility(item.id)}
        onMouseLeave={() => setSubMenuVisibility()}
      >
        {item.submenuItems.map(({ id, to, Icon, title, target }) => {
          return (
            <MainNavSubmenuLink
              key={id}
              to={to}
              id={id}
              target={target}
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

  return (
    <MainNavLink
      key={item.id}
      to={item.to}
      onFocus={() => setSubMenuVisibility(item.id)}
      onMouseEnter={() => setSubMenuVisibility(item.id)}
      title={item.title}
    >
      {item.title}
    </MainNavLink>
  );
}

export default function MainNavBar({ person }: MainNavBarProps) {
  const [activeSubmenuId, activateSubmenu] = useState('');
  const {
    SESSION: { isAuthenticated },
    MY_CHAPTERS: { items: myChapterItems },
  } = useContext(AppContext);

  const isResponsiveMenu = useTabletScreen();
  const [isResponsiveMenuMenuVisible, toggleResponsiveMenu] = useState(false);
  const { history } = useRouter();

  function closeResponsiveMenu(e: any) {
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
          Toggle menu
        </button>
      )}

      {isAuthenticated && (!isResponsiveMenu || isResponsiveMenuMenuVisible) && (
        <div id={LinkContainerId} className={styles.LinkContainer}>
          {menuItems.map(item => {
            let menuItem = item;
            if (item.id in submenuItems) {
              if (item.id === mainMenuItemId.MY_CHAPTERS) {
                menuItem = { ...item, submenuItems: myChapterItems };
              } else {
                menuItem = { ...item, submenuItems: submenuItems[item.id] };
              }
            }
            return getMenuItem(menuItem, activeSubmenuId, setSubMenuVisibility);
          })}
          <SecondaryLinks person={person} />
        </div>
      )}

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
