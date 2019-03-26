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
    styles.PageContentMain,
    className,
    styles[`PageContentMain__${variant}`] || styles.PageContentMain__default
  );

  return <main className={classNames}>{children}</main>;
}
