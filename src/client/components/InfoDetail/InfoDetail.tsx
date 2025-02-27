import React, { ReactNode, isValidElement } from 'react';

import { Heading } from '@amsterdam/design-system-react';
import classnames from 'classnames';

import styles from './InfoDetail.module.scss';

export interface InfoDetailGroupProps {
  children: ReactNode;
  label?: ReactNode;
  className?: string;
}

export interface InfoDetailProps {
  label: string;
  value: string | number | ReactNode;
  valueWrapperElement?: keyof JSX.IntrinsicElements;
  className?: string;
}

export interface InfoDetailHeadingProps {
  label: string;
}

export function InfoDetailHeading({ label }: InfoDetailHeadingProps) {
  return (
    <Heading level={3} size="level-4" className={styles.Label}>
      {label}
    </Heading>
  );
}

export function InfoDetailGroup({
  children,
  label,
  className,
}: InfoDetailGroupProps) {
  return (
    <div className={classnames(styles.InfoDetailGroup, className)}>
      {typeof label === 'string' && <InfoDetailHeading label={label} />}
      {typeof label !== 'string' && isValidElement(label) && label}
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
      <InfoDetailHeading label={label} />
      <ELValue className={styles.Value}>{value}</ELValue>
    </div>
  );
}
