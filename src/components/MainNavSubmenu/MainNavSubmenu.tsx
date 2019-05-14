import React from 'react';
import styles from './MainNavSubmenu.module.scss';
import classnames from 'classnames';
import { NavLink } from 'react-router-dom';
import useDebouncedCallback from 'use-debounce/lib/callback';
import { ComponentChildren } from 'App.types';
import { LinkProps } from 'App.types';

export interface MainNavSubmenuLinkProps extends Omit<LinkProps, 'title'> {
  id?: string;
  children: ComponentChildren;
  onFocus?: () => void;
}

export function MainNavSubmenuLink({
  to,
  children,
  id,
  target,
  ...rest
}: MainNavSubmenuLinkProps) {
  return !!target ? (
    <a
      href={to}
      target={target}
      className={styles.MainNavSubmenuLink}
      {...rest}
    >
      {children}
    </a>
  ) : (
    <NavLink to={to} className={styles.MainNavSubmenuLink} {...rest}>
      {children}
    </NavLink>
  );
}

export interface MainNavSubmenuProps {
  id: string;
  title: string;
  isOpen?: boolean;
  children: ComponentChildren;
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
    onMouseLeave();
  }, 200);
  const [debouncedEnter, cancelEnter] = useDebouncedCallback(() => {
    onMouseEnter();
  }, 200);

  return (
    <span className={styles.MainNavSubmenu}>
      <button
        className={classnames(
          styles.SubmenuButton,
          isOpen && styles.SubmenuButtonOpen
        )}
        onMouseLeave={() => {
          cancelEnter();
          debouncedLeave();
        }}
        onMouseEnter={() => {
          cancelLeave();
          debouncedEnter();
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
        onMouseLeave={() => debouncedLeave()}
      >
        <div className={styles.SubmenuItems}>{children}</div>
      </div>
    </span>
  );
}
