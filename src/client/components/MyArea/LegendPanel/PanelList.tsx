import classnames from 'classnames';
import { ReactNode } from 'react';
import styles from './PanelList.module.scss';

interface PanelListProps {
  children: ReactNode;
  className?: string;
}

export const PanelList = ({ children, className }: PanelListProps) => {
  return (
    <ol className={classnames(styles.PanelList, className)}>{children}</ol>
  );
};

export const PanelListItem = ({ children, className }: PanelListProps) => {
  return (
    <li className={classnames(styles.PanelListItem, className)}>{children}</li>
  );
};
