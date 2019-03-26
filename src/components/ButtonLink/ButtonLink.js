import React from 'react';
import { Link } from 'react-router-dom';
import styles from './ButtonLink.module.scss';
import classnames from 'classnames';

export default function ButtonLink({
  external = false,
  to,
  children,
  hasIcon = false,
  className,
}) {
  const classes = classnames(
    styles.ButtonLink,
    hasIcon && styles.IconLink,
    className
  );
  if (external) {
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
    <Link to={to} className={classes}>
      {children}
    </Link>
  );
}

export function ButtonLinkExternal(props) {
  return <ButtonLink {...props} external={true} />;
}

export function IconButtonLink(props) {
  return <ButtonLink {...props} hasIcon={true} />;
}
