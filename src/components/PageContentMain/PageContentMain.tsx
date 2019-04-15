import React from 'react';
import composeClassNames from 'classnames';
import styles from './PageContentMain.module.scss';
import { ChildrenContent } from 'App.types';

export interface PageContentMainProps {
  className?: any;
  variant?: 'default' | 'full';
  children: ChildrenContent;
}

export default function PageContentMain({
  className,
  variant = 'default',
  children,
}: PageContentMainProps) {
  const classNames = composeClassNames(
    styles.PageContentMain,
    className,
    styles[`PageContentMain__${variant}`] || styles.PageContentMain__default
  );

  return <main className={classNames}>{children}</main>;
}
