import {
  ComponentChildren,
  LinkProps,
} from '../../../universal/types/App.types';
import React, { HTMLAttributes, MouseEvent, useEffect, useState } from 'react';

import { Colors } from '../../../universal/config';
import { NavLink } from 'react-router-dom';
import classnames from 'classnames';
import styles from './MainNavSubmenu.module.scss';
import { trackLink } from '../../hooks/analytics.hook';
import { useDebouncedCallback } from 'use-debounce';
import useRouter from 'use-react-router';
import { SVGComponent } from '../../../universal/types/App.types';

export interface MainNavSubmenuLinkProps
  extends LinkProps,
    Omit<HTMLAttributes<HTMLAnchorElement>, 'title'> {
  className?: string;
  Icon?: SVGComponent;
}

export function MainNavSubmenuLink({
  to,
  onClick,
  className,
  rel,
  title,
  Icon,
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
      {Icon && (
        <span className={styles.SubmenuItemIcon}>
          <Icon aria-hidden="true" fill={Colors.neutralGrey4} />
        </span>
      )}
      <span className={styles.SubmenuItemTitle}>{title}</span>
    </a>
  ) : (
    <NavLink
      to={to}
      onClick={onClick}
      className={classnames(styles.MainNavSubmenuLink, className)}
      rel={rel}
      {...rest}
    >
      {Icon && (
        <span className={styles.SubmenuItemIcon}>
          <Icon aria-hidden="true" fill={Colors.neutralGrey4} />
        </span>
      )}
      <span className={styles.SubmenuItemTitle}>{title}</span>
    </NavLink>
  );
}

export interface MainNavSubmenuProps {
  id: string;
  title: string;
  children: ComponentChildren;
}

export default function MainNavSubmenu({
  title,
  children,
  id,
}: MainNavSubmenuProps) {
  const [isOpen, setMenuIsOpen] = useState(false);

  const [debouncedLeave, cancelLeave] = useDebouncedCallback(() => {
    setMenuIsOpen(false);
  }, 100);

  const [debouncedEnter, cancelEnter] = useDebouncedCallback(() => {
    setMenuIsOpen(true);
  }, 100);

  const onEnter = () => {
    cancelLeave();
    debouncedEnter();
  };

  const onLeave = () => {
    cancelEnter();
    debouncedLeave();
  };

  const { history } = useRouter();
  // Hides small screen menu on route change
  useEffect(() => {
    cancelEnter();
    setMenuIsOpen(false);
  }, [history.location, cancelEnter]);

  return (
    <span
      className={styles.MainNavSubmenu}
      data-submenu-id={id}
      onMouseEnter={onEnter}
      onFocus={onEnter}
      onMouseLeave={onLeave}
      onBlur={onLeave}
    >
      <button
        className={classnames(
          styles.SubmenuButton,
          isOpen && styles.SubmenuButtonOpen
        )}
        aria-expanded={isOpen}
      >
        <span>{title}</span>
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
