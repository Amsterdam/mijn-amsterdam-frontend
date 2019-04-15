import React from 'react';
import styles from './MainNavSubmenu.module.scss';
import classnames from 'classnames';
import { NavLink } from 'react-router-dom';
import useDebouncedCallback from 'use-debounce/lib/callback';
import { ChildrenContent } from 'App.types';

export interface MainNavSubmenuLinkProps {
  to: string;
  children: ChildrenContent;
}

export function MainNavSubmenuLink({
  to,
  children,
  ...rest
}: MainNavSubmenuLinkProps) {
  return (
    <NavLink to={to} className={styles.MainNavSubmenuLink} {...rest}>
      {children}
    </NavLink>
  );
}

export interface MainNavSubmenuProps {
  title: string;
  isOpen?: boolean;
  children: ChildrenContent;
  onMouseLeave: () => void;
}

export default function MainNavSubmenu({
  title,
  isOpen,
  children,
  onMouseLeave,
  ...rest
}: MainNavSubmenuProps) {
  const [debouncedLeave, cancelLeave] = useDebouncedCallback(() => {
    onMouseLeave();
  }, 200);

  return (
    <span className={styles.MainNavSubmenu}>
      <button
        className={classnames(
          styles.SubmenuButton,
          isOpen && styles.SubmenuButtonOpen
        )}
        onMouseLeave={debouncedLeave}
        {...rest}
      >
        <span>{title}</span>
      </button>
      <div
        aria-hidden={!isOpen}
        className={classnames(
          styles.SubmenuPanel,
          isOpen && styles.SubmenuPanelOpen
        )}
        onMouseEnter={() => cancelLeave()}
        onMouseLeave={() => onMouseLeave()}
      >
        <div className={styles.SubmenuItems}>{children}</div>
      </div>
    </span>
  );
}
