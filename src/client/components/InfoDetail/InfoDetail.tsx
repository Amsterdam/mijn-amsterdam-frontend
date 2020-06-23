import React, { ReactNode } from 'react';
import styles from './InfoDetail.module.scss';
import { ComponentChildren } from '../../../universal/types/App.types';

export interface InfoDetailGroupProps {
  children: ComponentChildren;
}

export interface InfoDetailProps {
  label: string;
  value: string | number | ReactNode;
}

export function InfoDetailGroup({ children }: InfoDetailGroupProps) {
  return <div className={styles.InfoDetailGroup}>{children}</div>;
}

export default function InfoDetail({ label, value }: InfoDetailProps) {
  return (
    <div className={styles.InfoDetail}>
      <span className={styles.Label}>{label}</span>
      <span className={styles.Value}>{value}</span>
    </div>
  );
}
