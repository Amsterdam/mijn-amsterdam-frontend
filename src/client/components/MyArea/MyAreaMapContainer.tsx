import React from 'react';
import { PropsWithChildren } from 'react';
import classnames from 'classnames';
import styles from './MyArea2.module.scss';

export function MyAreaMapContainer({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div className={classnames(styles.MyAreaMapContainer, className)}>
      {children}
    </div>
  );
}
