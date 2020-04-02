import React, { HTMLProps } from 'react';

import { ComponentChildren } from '../../../universal/types/App.types';
import composeClassNames from 'classnames';
import styles from './Page.module.scss';

export interface PageProps extends HTMLProps<HTMLDivElement> {
  className?: string;
  children: ComponentChildren;
}

export default function Page({
  className,
  children,
  ...otherProps
}: PageProps) {
  const classNames = composeClassNames(styles.Page, className);

  return (
    <main {...otherProps} className={classNames}>
      {children}
    </main>
  );
}

export function TextPage({ children, className, ...otherProps }: PageProps) {
  return (
    <Page
      {...otherProps}
      className={composeClassNames(styles.TextPage, className)}
    >
      {children}
    </Page>
  );
}

export function OverviewPage({
  children,
  className,
  ...otherProps
}: PageProps) {
  return (
    <Page
      {...otherProps}
      className={composeClassNames(styles.OverviewPage, className)}
    >
      {children}
    </Page>
  );
}

export function DetailPage({ children, className, ...otherProps }: PageProps) {
  return (
    <Page
      {...otherProps}
      className={composeClassNames(styles.DetailPage, className)}
    >
      {children}
    </Page>
  );
}

export function PageContent({ children, className, ...otherProps }: PageProps) {
  return (
    <div
      {...otherProps}
      className={composeClassNames(styles.PageContent, className)}
    >
      {children}
    </div>
  );
}
