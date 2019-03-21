import React from 'react';
import composeClassNames from 'classnames';
import styles from './PageContentMain.module.scss';

export default function PageContentMain({
  className,
  variant,
  children,
  heading,
}) {
  const classNames = composeClassNames(
    className || styles.PageContentMain,
    styles[`PageContentMain--${variant}`] || styles[`PageContentMain--default`]
  );

  return <article className={classNames}>{children}</article>;
}
