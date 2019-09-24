import React from 'react';
import composeClassNames from 'classnames';
import styles from './PageContentMain.module.scss';
import { ComponentChildren } from 'App.types';

export interface PageContentMainProps {
  className?: any;
  children: ComponentChildren;
}

export default function PageContentMain({
  className,
  children,
}: PageContentMainProps) {
  const classNames = composeClassNames(styles.PageContentMain, className);

  return <main className={classNames}>{children}</main>;
}
