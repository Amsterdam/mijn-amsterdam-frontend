import { ComponentChildren } from '../../../universal/types';
import React from 'react';
import styles from './AlphaComponent.module.scss';

export interface ComponentProps {
  children?: ComponentChildren;
}

export default function AlphaComponent({ children }: ComponentProps) {
  return <div className={styles.AlphaComponent}>AlphaComponent{children}</div>;
}
