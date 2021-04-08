import { ReactNode } from 'react';
import styles from './InfoDetail.module.scss';
import { ComponentChildren } from '../../../universal/types/App.types';
import classnames from 'classnames';

export interface InfoDetailGroupProps {
  children: ComponentChildren;
  label?: string;
}

export interface InfoDetailProps {
  label: string;
  value: string | number | ReactNode;
  el?: keyof JSX.IntrinsicElements;
  className?: string;
}

export function InfoDetailGroup({ children, label }: InfoDetailGroupProps) {
  return (
    <div className={styles.InfoDetailGroup}>
      {!!label && <h4 className={styles.Label}>{label}</h4>}
      <div className={styles.InfoDetailGroupContent}>{children}</div>
    </div>
  );
}

export default function InfoDetail({
  label,
  value,
  el = 'p',
  className,
}: InfoDetailProps) {
  const El = el;
  return (
    <El className={classnames(styles.InfoDetail, className)}>
      <span className={styles.Label}>{label}</span>
      <span className={styles.Value}>{value}</span>
    </El>
  );
}
