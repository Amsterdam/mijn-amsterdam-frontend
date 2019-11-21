import React, { HTMLProps } from 'react';
import styles from './Panel.module.scss';
import { ComponentChildren } from 'App.types';
import classnames from 'classnames';

export interface PanelProps extends HTMLProps<HTMLDivElement> {
  className?: string;
  children: ComponentChildren;
}

export default function Panel({
  children,
  className,
  ...otherProps
}: PanelProps) {
  return (
    <div {...otherProps} className={classnames(styles.Panel, className)}>
      {children}
    </div>
  );
}
