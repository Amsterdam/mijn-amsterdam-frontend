import React from 'react';
import styles from './MainNavSubmenu.module.scss';
import classnames from 'classnames';
import { NavLink } from 'react-router-dom';
import useDebouncedCallback from 'use-debounce/lib/callback';
import { ComponentChildren } from 'App.types';
import { LinkProps } from 'App.types';
import { trackLink } from 'hooks/analytics.hook';

export interface MainNavSubmenuLinkProps extends Omit<LinkProps, 'title'> {
  children: ComponentChildren;
  onFocus?: () => void;
}

export function MainNavSubmenuLink({
  to,
  children,
  rel,
  ...rest
}: MainNavSubmenuLinkProps) {
  return rel && rel.indexOf('external') !== -1 ? (
    <a
      href={to}
      onClick={() => trackLink(to)}
      rel={rel}
      target="_blank"
      className={styles.MainNavSubmenuLink}
      {...rest}
    >
      {children}
    </a>
  ) : (
    <NavLink to={to} className={styles.MainNavSubmenuLink} rel={rel} {...rest}>
      {children}
    </NavLink>
  );
}

export interface MainNavSubmenuProps {
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
