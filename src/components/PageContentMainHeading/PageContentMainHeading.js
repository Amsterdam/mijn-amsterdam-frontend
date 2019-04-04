import React from 'react';
import styles from './PageContentMainHeading.module.scss';
import composeClassNames from 'classnames';
import Heading from 'components/Heading/Heading';

export default function PageContentMainHeading({
  el = 'h2',
  variant,
  children,
  className,
}) {
  const classNames = composeClassNames(
    styles.PageContentMainHeading,
    variant && styles[`PageContentMainHeading__${variant}`],
    className
  );
  return (
    <Heading el={el} size="large" className={classNames}>
      {children}
    </Heading>
  );
}
