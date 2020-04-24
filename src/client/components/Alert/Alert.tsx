import classnames from 'classnames';
import React from 'react';
import { ComponentChildren } from '../../../universal/types';
import { IconAlert, IconCheckmark } from '../../assets/icons';
import styles from './Alert.module.scss';

export type AlertType = 'warning' | 'info' | 'success';

export interface ComponentProps {
  children?: ComponentChildren;
  type?: AlertType;
  className?: string;
}

function getIcon(alertType: AlertType) {
  let Icon;
  switch (alertType) {
    case 'warning':
      Icon = IconAlert;
      break;
    default:
      Icon = IconCheckmark;
      break;
  }
  return <Icon aria-hidden="true" className={styles.Icon} />;
}

export default function Alert({
  children,
  type = 'success',
  className,
}: ComponentProps) {
  return (
    <div className={classnames(styles.Alert, styles[type], className)}>
      {getIcon(type)} {children}
    </div>
  );
}
