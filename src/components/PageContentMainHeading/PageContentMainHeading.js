import React from 'react';
import styles from './PageContentMainHeading.module.scss';
import composeClassNames from 'classnames';

export default function PageContentMainHeading({
  size = 2,
  variant,
  children,
  className,
}) {
  const H = `h${size}`;
  const classNames = composeClassNames(
    styles.PageContentMainHeading,
    variant && styles[`PageContentMainHeading__${variant}`],
    className
  );
  return <H className={classNames}>{children}</H>;
}
