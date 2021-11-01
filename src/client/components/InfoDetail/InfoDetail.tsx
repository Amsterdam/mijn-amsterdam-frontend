import { ReactNode } from 'react';
import styles from './InfoDetail.module.scss';
import { ComponentChildren } from '../../../universal/types/App.types';
import classnames from 'classnames';
import Heading, { HeadingTagName } from '../Heading/Heading';

export interface InfoDetailGroupProps {
  children: ComponentChildren;
  label?: string;
  className?: string;
}

export interface InfoDetailProps {
  label: string;
  value: string | number | ReactNode;
  valueWrapperElement?: keyof JSX.IntrinsicElements;
  labelElement?: HeadingTagName;
  className?: string;
}

export function InfoDetailGroup({
  children,
  label,
  className,
}: InfoDetailGroupProps) {
  return (
    <div className={classnames(styles.InfoDetailGroup, className)}>
      {!!label && <h3 className={styles.Label}>{label}</h3>}
      <div className={styles.InfoDetailGroupContent}>{children}</div>
    </div>
  );
}

export default function InfoDetail({
  label,
  value,
  className,
  valueWrapperElement = 'p',
  labelElement = 'h3',
}: InfoDetailProps) {
  const ELValue = valueWrapperElement;
  return (
    <div className={classnames(styles.InfoDetail, className)}>
      <Heading el={labelElement} size="tiny" className={styles.Label}>
        {label}
      </Heading>
      <ELValue className={styles.Value}>{value}</ELValue>
    </div>
  );
}
