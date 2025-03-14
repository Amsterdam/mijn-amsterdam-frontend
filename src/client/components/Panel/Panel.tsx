import { HTMLProps } from 'react';

import classnames from 'classnames';

import styles from './Panel.module.scss';
import { ComponentChildren } from '../../../universal/types';

export interface PanelProps extends HTMLProps<HTMLDivElement> {
  className?: string;
  children: ComponentChildren;
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
