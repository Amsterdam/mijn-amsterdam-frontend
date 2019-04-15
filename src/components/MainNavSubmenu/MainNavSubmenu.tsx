import React from 'react';
import styles from './MainNavSubmenu.module.scss';
import classnames from 'classnames';
import { NavLink } from 'react-router-dom';
import useDebouncedCallback from 'use-debounce/lib/callback';
import { ChildrenContent } from 'App.types';

export interface MainNavSubmenuLinkProps {
  id?: string;
  to: string;
  children: ChildrenContent;
  onFocus?: () => void;
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
  id: string;
  title: string;
  isOpen?: boolean;
  children: ChildrenContent;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onFocus: () => void;
  onClick: (event: any) => void;
}

export default function MainNavSubmenu({
  title,
  isOpen,
  children,
  onMouseLeave,
  onMouseEnter,
  ...rest
}: MainNavSubmenuProps) {
  const [debouncedLeave, cancelLeave] = useDebouncedCallback(() => {
    console.log('onMouseLeave!');
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
        onMouseEnter={() => {
          cancelLeave();
          onMouseEnter();
        }}
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
