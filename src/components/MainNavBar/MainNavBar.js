import MainNavSubmenu, {
  MainNavSubmenuLink,
} from 'components/MainNavSubmenu/MainNavSubmenu';
import React, { useState, useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AppContext } from 'AppState';
import { MenuConfig } from './MainNavBar.constants';
import styles from './MainNavBar.module.scss';
import { Colors } from 'App.constants';

function MainNavLink({ children, to, ...rest }) {
  return (
    <NavLink to={to} className={styles.MainNavLink} {...rest}>
      {children}
    </NavLink>
  );
}

function getMenuItem(MenuItem, activeSubmenuId, setSubMenuVisibility) {
  if ('submenuItems' in MenuItem) {
    const isOpen = activeSubmenuId === MenuItem.id;
    return (
      <MainNavSubmenu
        key={MenuItem.id}
        id={MenuItem.id}
        title={MenuItem.title}
        isOpen={isOpen}
        onFocus={() => !isOpen && setSubMenuVisibility(MenuItem.id)}
        onClick={event => event.preventDefault()} // Prevent chrome from closing the submenu by triggering focus handler on click
        onMouseEnter={() => setSubMenuVisibility(MenuItem.id)}
        onMouseLeave={() => setSubMenuVisibility()}
      >
        {MenuItem.submenuItems.map(({ id, to, Icon, title }) => {
          return (
            <MainNavSubmenuLink
              key={id}
              to={to}
              id={id}
              onFocus={() => setSubMenuVisibility(MenuItem.id, true)}
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
      key={MenuItem.id}
      id={MenuItem.id}
      to={MenuItem.to}
      onFocus={() => setSubMenuVisibility(MenuItem.id)}
      onMouseEnter={() => setSubMenuVisibility(MenuItem.id)}
    >
      {MenuItem.title}
    </MainNavLink>
  );
}

export default function MainNavBar() {
  const [activeSubmenuId, activateSubmenu] = useState('');
  const {
    SESSION: { isAuthenticated },
  } = useContext(AppContext);

  function setSubMenuVisibility(id, isSubmenuTrigger = false) {
    if (id && activeSubmenuId !== id) {
      activateSubmenu(id);
    } else if (!isSubmenuTrigger) {
      activateSubmenu('');
    }
  }

  return (
    <nav className={styles.MainNavBar}>
      {isAuthenticated && (
        <div className={styles.LinkContainer}>
          {MenuConfig.map(MenuItem =>
            getMenuItem(MenuItem, activeSubmenuId, setSubMenuVisibility)
          )}
        </div>
      )}
    </nav>
  );
}
