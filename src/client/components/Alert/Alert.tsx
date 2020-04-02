import { ReactComponent as AlertIcon } from '../../assets/icons/Alert.svg';
import { ReactComponent as CheckmarkIcon } from '../../assets/icons/Checkmark.svg';
import { ComponentChildren } from '../../../universal/types/App.types';
import React from 'react';
import classnames from 'classnames';
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
      Icon = AlertIcon;
      break;
    default:
      Icon = CheckmarkIcon;
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
