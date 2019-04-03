import React from 'react';
import styles from './MyChaptersPanel.module.scss';
import { MyChaptersMenuItems } from 'components/MainNavBar/MainNavBar.constants';
import { MainNavSubmenuLink } from 'components/MainNavSubmenu/MainNavSubmenu';
import { Colors } from 'App.constants';

export default function MyChaptersPanel({ title }) {
  return (
    <div className={styles.MyChaptersPanel}>
      <h3 className={styles.Title}>{title}</h3>
      <div className={styles.Links}>
        {MyChaptersMenuItems.map(({ id, to, Icon, label }) => {
          return (
            <MainNavSubmenuLink key={id} to={to} id={id}>
              {Icon && <Icon fill={Colors.neutralGrey4} aria-hidden="true" />}
              {label}
            </MainNavSubmenuLink>
          );
        })}
      </div>
    </div>
  );
}
