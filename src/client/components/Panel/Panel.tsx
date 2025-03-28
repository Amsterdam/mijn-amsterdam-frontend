import { HTMLProps, ReactNode } from 'react';

import classnames from 'classnames';

import styles from './Panel.module.scss';

export interface PanelProps extends HTMLProps<HTMLDivElement> {
  className?: string;
  children: ReactNode;
}

export default function Panel({
  children,
  className,
  ...otherProps
}: PanelProps) {
  return (
    <div {...otherProps} className={classnames(styles.Panel, className)}>
      {children}
    </div>
  );
}
