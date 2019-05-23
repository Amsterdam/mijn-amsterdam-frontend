import React from 'react';
import styles from './Alert.module.scss';
import { ComponentChildren } from 'App.types';
import { ReactComponent as AlertIcon } from 'assets/icons/Alert.svg';
import { ReactComponent as CheckmarkIcon } from 'assets/icons/Checkmark.svg';
import classnames from 'classnames';

export type AlertType = 'warning' | 'info' | 'success';

export interface ComponentProps {
  children?: ComponentChildren;
  type?: AlertType;
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
  return <Icon className={styles.Icon} />;
}

export default function Alert({ children, type = 'success' }: ComponentProps) {
  return (
    <p className={classnames(styles.Alert, styles[type])}>
      {getIcon(type)} {children}
    </p>
  );
}
