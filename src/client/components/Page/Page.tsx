import React, { HTMLProps } from 'react';

import { ComponentChildren } from '../../../universal/types';
import composeClassNames from 'classnames';
import styles from './Page.module.scss';

export interface PageProps extends HTMLProps<HTMLDivElement> {
  className?: string;
  children: ComponentChildren;
}

export default function Page({
  className,
  children,
  id,
  ...otherProps
}: PageProps) {
  const classNames = composeClassNames(styles.Page, className);

  return (
    <main {...otherProps} id={id} className={classNames}>
      {children}
    </main>
  );
}

export function TextPage({ children, className, id }: PageProps) {
  return (
    <Page id={id} className={composeClassNames(styles.TextPage, className)}>
      {children}
    </Page>
  );
}

export function OverviewPage({ children, className, id }: PageProps) {
  return (
    <Page id={id} className={composeClassNames(styles.OverviewPage, className)}>
      {children}
    </Page>
  );
}

export function DetailPage({ children, className, id }: PageProps) {
  return (
    <Page id={id} className={composeClassNames(styles.DetailPage, className)}>
      {children}
    </Page>
  );
}

export function PageContent({ children, className, id }: PageProps) {
  return (
    <div id={id} className={composeClassNames(styles.PageContent, className)}>
      {children}
    </div>
  );
}
