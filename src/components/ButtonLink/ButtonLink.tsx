import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ButtonLink.module.scss';
import classnames from 'classnames';
import { ComponentChildren, LinkProps } from 'App.types';

export interface ButtonLinkProps {
  to: string;
  children: ComponentChildren;
  hasIcon?: boolean;
  className?: any;
  white?: boolean;
  target?: LinkProps['target'];
  rel?: string;
  download?: string;
  title?: string;
  'data-track'?: any[];
  id?: string;
  tabIndex?: number;
}

export default function ButtonLink({
  to,
  children,
  hasIcon = false,
  className,
  white = false,
  target,
  rel,
  ...otherProps
}: ButtonLinkProps) {
  const classes = classnames(
    styles.ButtonLink,
    hasIcon && styles.IconLink,
    className,
    white && styles.ButtonLinkWhite
  );
  if (!!target || (rel && rel.indexOf('external') !== -1)) {
    if (target === '_blank') {
      return (
        <a
          {...otherProps}
          href={to}
          target="_blank"
          rel="external noopener noreferrer"
          className={classes}
        >
          {children}
        </a>
      );
    }
    return (
      <a
        {...otherProps}
        href={to}
        rel={rel}
        target={target}
        className={classes}
      >
        {children}
      </a>
    );
  }
  return (
    <Link {...otherProps} to={to} className={classes}>
      {children}
    </Link>
  );
}

export function ButtonLinkExternal(props: ButtonLinkProps) {
  return <ButtonLink {...props} rel="external" />;
}

export function IconButtonLink(props: Omit<ButtonLinkProps, 'hasIcon'>) {
  return <ButtonLink {...props} hasIcon={true} />;
}
