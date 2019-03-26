import React from 'react';
import styles from './MainNavSubmenu.module.scss';
import classnames from 'classnames';
import { NavLink } from 'react-router-dom';

export function MainNavSubmenuLink({ to, children, ...rest }) {
  return (
    <NavLink to={to} className={styles.MainNavSubmenuLink} {...rest}>
      {children}
    </NavLink>
  );
}

export default function MainNavSubmenu({
  title,
  open,
  toggleSubmenu,
  children,
  ...rest
}) {
  return (
    <span className={styles.MainNavSubmenu}>
      <button
        className={classnames(
          styles.SubmenuButton,
          open && styles.SubmenuButtonOpen
        )}
        onClick={toggleSubmenu}
        {...rest}
      >
        {title}
      </button>
      <div
        className={classnames(
          styles.SubmenuPanel,
          open && styles.SubmenuPanelOpen
        )}
      >
        <div className={styles.SubmenuItems}>{children}</div>
      </div>
    </span>
  );
}
