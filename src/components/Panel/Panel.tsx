import React, { HTMLProps } from 'react';
import styles from './Panel.module.scss';
import { ComponentChildren } from 'App.types';

export interface PanelProps extends HTMLProps<HTMLDivElement> {
  className?: any;
  children: ComponentChildren;
}

export default function Panel({ children, className }: PanelProps) {
  return <div className={styles.Panel}>{children}</div>;
}
