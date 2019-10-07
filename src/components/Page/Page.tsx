import React, { HTMLProps } from 'react';
import composeClassNames from 'classnames';
import styles from './Page.module.scss';
import { ComponentChildren } from 'App.types';

export interface PageProps extends HTMLProps<HTMLDivElement> {
  className?: any;
  children: ComponentChildren;
}

export default function Page({ className, children }: PageProps) {
  const classNames = composeClassNames(styles.Page, className);

  return <main className={classNames}>{children}</main>;
}

export function TextPage({ children, className }: PageProps) {
  return (
    <Page className={composeClassNames(styles.TextPage, className)}>
      {children}
    </Page>
  );
}

export function OverviewPage({ children, className }: PageProps) {
  return (
    <Page className={composeClassNames(styles.OverviewPage, className)}>
      {children}
    </Page>
  );
}

export function DetailPage({ children, className }: PageProps) {
  return (
    <Page className={composeClassNames(styles.DetailPage, className)}>
      {children}
    </Page>
  );
}

export function PageContent({ children, className }: PageProps) {
  return (
    <div className={composeClassNames(styles.PageContent, className)}>
      {children}
    </div>
  );
}
