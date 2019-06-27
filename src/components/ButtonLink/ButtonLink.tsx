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
  download?: string;
  'data-track'?: any[];
}

export default function ButtonLink({
  to,
  children,
  hasIcon = false,
  className,
  white = false,
  target,
  ...otherProps
}: ButtonLinkProps) {
  const classes = classnames(
    styles.ButtonLink,
    hasIcon && styles.IconLink,
    className,
    white && styles.ButtonLinkWhite
  );
  if (!!target) {
    if (target === '_blank') {
      return (
        <a
          {...otherProps}
          href={to}
          target="_blank"
          rel="noopener noreferrer"
          className={classes}
        >
          {children}
        </a>
      );
    }
    return (
      <a {...otherProps} href={to} target={target} className={classes}>
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
  return <ButtonLink {...props} target={props.target || '_self'} />;
}

export function IconButtonLink(props: Omit<ButtonLinkProps, 'hasIcon'>) {
  return <ButtonLink {...props} hasIcon={true} />;
}
