import React, { MouseEvent, HTMLAttributes } from 'react';
import styles from './MainNavSubmenu.module.scss';
import classnames from 'classnames';
import { NavLink } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import { ComponentChildren } from 'App.types';
import { LinkProps } from 'App.types';
import { trackLink } from 'hooks/analytics.hook';

export interface MainNavSubmenuLinkProps
  extends Omit<LinkProps, 'title'>,
    HTMLAttributes<HTMLAnchorElement> {
  children: ComponentChildren;
  onFocus?: () => void;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  className?: string;
}

export function MainNavSubmenuLink({
  to,
  children,
  onClick,
  className,
  rel,
  ...rest
}: MainNavSubmenuLinkProps) {
  return rel && rel.indexOf('external') !== -1 ? (
    <a
      href={to}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        onClick && onClick(event);
        trackLink(to);
      }}
      rel={rel}
      className={classnames(styles.MainNavSubmenuLink, className)}
      {...rest}
    >
      {children}
    </a>
  ) : (
    <NavLink
      to={to}
      onClick={onClick}
      className={classnames(styles.MainNavSubmenuLink, className)}
      rel={rel}
      {...rest}
    >
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
  id,
  ...rest
}: MainNavSubmenuProps) {
  const [debouncedLeave, cancelLeave] = useDebouncedCallback(() => {
    onMouseLeave();
  }, 200);
  const [debouncedEnter, cancelEnter] = useDebouncedCallback(() => {
    onMouseEnter();
  }, 200);

  return (
    <span className={styles.MainNavSubmenu} data-submenu-id={id}>
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
        aria-expanded={isOpen}
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
