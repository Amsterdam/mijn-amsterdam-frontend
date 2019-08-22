import React from 'react';
import styles from './Tutorial.module.scss';
import classnames from 'classnames';
import { ComponentChildren } from 'App.types';

export interface ComponentProps {
  children?: ComponentChildren;
}

export default function Tutorial({ children }: ComponentProps) {
  return <div className={styles.Tutorial} />;
}
