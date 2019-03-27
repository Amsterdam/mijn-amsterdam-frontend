import MainNavSubmenu, {
  MainNavSubmenuLink,
} from 'components/MainNavSubmenu/MainNavSubmenu';
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

import { MenuConfig } from './MainNavBar.constants';
import styles from './MainNavBar.module.scss';

function MainNavLink({ children, to, ...rest }) {
  return (
    <NavLink to={to} className={styles.MainNavLink} {...rest}>
      {children}
    </NavLink>
  );
}

function getMenuItem(MenuItem, activeSubmenuId, setSubMenuVisibility) {
  if ('submenuItems' in MenuItem) {
    return (
      <MainNavSubmenu
        id={MenuItem.id}
        title={MenuItem.label}
        isOpen={activeSubmenuId === MenuItem.id}
        onFocus={() => setSubMenuVisibility(MenuItem.id)}
        onMouseenter={() => setSubMenuVisibility(MenuItem.id)}
      >
        {MenuItem.submenuItems.map(({ id, to, Icon, label }) => {
          return (
            <MainNavSubmenuLink
              to={to}
              id={id}
              onFocus={() => setSubMenuVisibility(MenuItem.id, true)}
            >
              {Icon && <Icon aria-hidden="true" />}
              {label}
            </MainNavSubmenuLink>
          );
        })}
      </MainNavSubmenu>
    );
  }

  return (
    <MainNavLink
      id={MenuItem.id}
      to={MenuItem.to}
      onFocus={() => setSubMenuVisibility(MenuItem.id)}
    >
      {MenuItem.label}
    </MainNavLink>
  );
}

export default function MainNavBar() {
  const [activeSubmenuId, activateSubmenu] = useState('');

  function setSubMenuVisibility(id, isSubmenuTrigger) {
    if (id && activeSubmenuId !== id) {
      activateSubmenu(id);
    } else if (!isSubmenuTrigger) {
      activateSubmenu('');
    }
  }

  return (
    <nav className={styles.MainNavBar}>
      <div className={styles.LinkContainer}>
        {MenuConfig.map(MenuItem =>
          getMenuItem(MenuItem, activeSubmenuId, setSubMenuVisibility)
        )}
      </div>
    </nav>
  );
}
