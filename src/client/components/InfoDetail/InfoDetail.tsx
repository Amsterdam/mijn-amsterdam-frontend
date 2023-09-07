import { ReactNode } from 'react';
import styles from './InfoDetail.module.scss';
import { ComponentChildren } from '../../../universal/types/App.types';
import classnames from 'classnames';
import { Heading } from '@amsterdam/design-system-react';

export interface InfoDetailGroupProps {
  children: ComponentChildren;
  label?: string;
  className?: string;
}

export interface InfoDetailProps {
  label: string;
  value: string | number | ReactNode;
  valueWrapperElement?: keyof JSX.IntrinsicElements;
  className?: string;
}

export function InfoDetailGroup({
  children,
  label,
  className,
}: InfoDetailGroupProps) {
  return (
    <div className={classnames(styles.InfoDetailGroup, className)}>
      {!!label && (
        <Heading level={3} size="level-4" className={styles.Label}>
          {label}
        </Heading>
      )}
      <div className={styles.InfoDetailGroupContent}>{children}</div>
    </div>
  );
}

export default function InfoDetail({
  label,
  value,
  className,
  valueWrapperElement = 'p',
}: InfoDetailProps) {
  const ELValue = valueWrapperElement;
  return (
    <div className={classnames(styles.InfoDetail, className)}>
      <Heading level={3} size="level-4" className={styles.Label}>
        {label}
      </Heading>
      <ELValue className={styles.Value}>{value}</ELValue>
    </div>
  );
}
