import React from 'react';
import styles from './AlphaComponent.module.scss';
import { ComponentChildren } from 'App.types';

export interface AlphaComponentProps {
  children?: ComponentChildren;
}

export default function AlphaComponent({ children }: AlphaComponentProps) {
  return <div className={styles.AlphaComponent}>AlphaComponent {children}</div>;
}
