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
}

export default function ButtonLink({
  to,
  children,
  hasIcon = false,
  className,
  white = false,
  target,
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
      <a href={to} target={target} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <Link to={to} className={classes}>
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
