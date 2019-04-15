import React from 'react';
import styles from './AlphaComponent.module.scss';
import { ChildrenContent } from 'App.types';

export interface AlphaComponentProps {
  children?: ChildrenContent;
}

export default function AlphaComponent({ children }: AlphaComponentProps) {
  return <div className={styles.AlphaComponent}>AlphaComponent {children}</div>;
}
