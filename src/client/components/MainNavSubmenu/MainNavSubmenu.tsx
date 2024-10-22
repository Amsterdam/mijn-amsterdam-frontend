import { HTMLAttributes, MouseEvent, useEffect, useState } from 'react';

import classnames from 'classnames';
import { NavLink, useLocation } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';

import styles from './MainNavSubmenu.module.scss';
import {
  ComponentChildren,
  LinkProps,
  SVGComponent,
} from '../../../universal/types';
import { Colors } from '../../config/app';
import { trackLink } from '../../hooks/analytics.hook';

const MENU_TOGGLE_DELAY_MS = 100;

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
  return rel?.includes('external') || to.startsWith('http') ? (
    <a
      href={to}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        if (onClick) {
          onClick(event);
        }
        trackLink(to, title);
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

  const debouncedLeave = useDebouncedCallback(() => {
    setMenuIsOpen(false);
  }, MENU_TOGGLE_DELAY_MS);

  const debouncedEnter = useDebouncedCallback(() => {
    setMenuIsOpen(true);
  }, MENU_TOGGLE_DELAY_MS);

  const onEnter = () => {
    debouncedLeave.cancel();
    debouncedEnter();
  };

  const onLeave = () => {
    debouncedEnter.cancel();
    debouncedLeave();
  };

  const location = useLocation();
  // Hides small screen menu on route change
  useEffect(() => {
    debouncedEnter.cancel();
    setMenuIsOpen(false);
  }, [location.pathname, debouncedEnter]);

  // Add Escape dismissal. WCAG requirement.
  useEffect(() => {
    const onEscape = (event: any) => {
      if (event.key === 'Escape') {
        onLeave();
      }
    };
    document.addEventListener('keyup', onEscape);
    return () => {
      document.removeEventListener('keyup', onEscape);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
