import MainNavSubmenu, {
  MainNavSubmenuLink,
} from 'components/MainNavSubmenu/MainNavSubmenu';
import React, { useState, useContext } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AppContext } from 'AppState';
import { menuItems, MenuItem } from './MainNavBar.constants';
import styles from './MainNavBar.module.scss';
import { Colors } from 'App.constants';
import { ChildrenContent, LinkProps } from 'App.types';

export interface MainNavLinkProps {
  to: string;
  children: ChildrenContent;
  onFocus?: () => void;
  onMouseEnter?: () => void;
}

function MainNavLink({ children, to, ...rest }: MainNavLinkProps) {
  return (
    <NavLink to={to} className={styles.MainNavLink} {...rest}>
      {children}
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
        {item.submenuItems.map(({ id, to, Icon, title }) => {
          return (
            <MainNavSubmenuLink
              key={id}
              to={to}
              id={id}
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
    >
      {item.title}
    </MainNavLink>
  );
}

export default function MainNavBar() {
  const [activeSubmenuId, activateSubmenu] = useState('');
  const {
    SESSION: { isAuthenticated },
  } = useContext(AppContext);

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

  return (
    <nav className={styles.MainNavBar}>
      {isAuthenticated && (
        <div className={styles.LinkContainer}>
          {menuItems.map(item =>
            getMenuItem(item, activeSubmenuId, setSubMenuVisibility)
          )}
        </div>
      )}
    </nav>
  );
}
