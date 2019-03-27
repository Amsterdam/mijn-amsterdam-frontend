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

export default function MainNavSubmenu({ title, isOpen, children, ...rest }) {
  return (
    <span className={styles.MainNavSubmenu}>
      <button
        className={classnames(
          styles.SubmenuButton,
          isOpen && styles.SubmenuButtonOpen
        )}
        {...rest}
      >
        {title}
      </button>
      <div
        aria-hidden={!isOpen}
        className={classnames(
          styles.SubmenuPanel,
          isOpen && styles.SubmenuPanelOpen
        )}
      >
        <div className={styles.SubmenuItems}>{children}</div>
      </div>
    </span>
  );
}
