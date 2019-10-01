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

export function TextPage({ children, className }: PageContentMainProps) {
  return (
    <PageContentMain className={composeClassNames(styles.TextPage, className)}>
      {children}
    </PageContentMain>
  );
}

export function OverviewPage({ children, className }: PageContentMainProps) {
  return (
    <PageContentMain
      className={composeClassNames(styles.OverviewPage, className)}
    >
      {children}
    </PageContentMain>
  );
}

export function DetailPage({ children, className }: PageContentMainProps) {
  return (
    <PageContentMain
      className={composeClassNames(styles.DetailPage, className)}
    >
      {children}
    </PageContentMain>
  );
}

export function PageContent({ children, className }: PageContentMainProps) {
  return (
    <div className={composeClassNames(styles.PageContent, className)}>
      {children}
    </div>
  );
}
