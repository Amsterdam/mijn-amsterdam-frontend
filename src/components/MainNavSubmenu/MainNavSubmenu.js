import React from 'react';
import styles from './MainNavSubmenu.module.scss';
import classnames from 'classnames';
import { NavLink } from 'react-router-dom';

export function MainNavSubmenuLink({ to, children }) {
  return (
    <NavLink to={to} className={styles.MainNavSubmenuLink}>
      {children}
    </NavLink>
  );
}

export default function MainNavSubmenu({
  title,
  isActive,
  toggleSubmenu,
  children,
}) {
  return (
    <span className={styles.MainNavSubmenu}>
      <button
        className={classnames(
          styles.SubmenuButton,
          isActive && styles.SubmenuButtonOpen
        )}
        onClick={toggleSubmenu}
      >
        {title}
      </button>
      <div
        className={classnames(
          styles.SubmenuPanel,
          isActive && styles.SubmenuPanelOpen
        )}
      >
        <div className={styles.SubmenuItems}>{children}</div>
      </div>
    </span>
  );
}
