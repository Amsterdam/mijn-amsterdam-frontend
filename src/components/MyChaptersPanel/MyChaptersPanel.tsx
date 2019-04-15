import React from 'react';
import styles from './MyChaptersPanel.module.scss';
import { myChaptersMenuItems } from 'components/MainNavBar/MainNavBar.constants';
import { MainNavSubmenuLink } from 'components/MainNavSubmenu/MainNavSubmenu';
import { Colors } from 'App.constants';
import Heading from 'components/Heading/Heading';

export interface MyChaptersPanelProps {
  title: string;
}

export default function MyChaptersPanel({ title }: MyChaptersPanelProps) {
  return (
    <div className={styles.MyChaptersPanel}>
      <Heading size="mediumLarge" className={styles.Title}>
        {title}
      </Heading>
      <div className={styles.Links}>
        {myChaptersMenuItems.map(({ id, to, Icon, title }) => {
          return (
            <MainNavSubmenuLink key={id} to={to} id={id}>
              {Icon && <Icon fill={Colors.neutralGrey4} aria-hidden="true" />}
              {title}
            </MainNavSubmenuLink>
          );
        })}
      </div>
    </div>
  );
}
