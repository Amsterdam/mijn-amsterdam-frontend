import React from 'react';
import styles from './MyChaptersPanel.module.scss';
import { MainNavSubmenuLink } from 'components/MainNavSubmenu/MainNavSubmenu';
import { Colors } from 'App.constants';
import Heading from 'components/Heading/Heading';
import { MenuItem } from '../MainNavBar/MainNavBar.constants';
import LoadingContent from 'components/LoadingContent/LoadingContent';

export interface MyChaptersPanelProps {
  title: string;
  items: MenuItem[];
  isLoading: boolean;
}

export default function MyChaptersPanel({
  title,
  items = [],
  isLoading = true,
}: MyChaptersPanelProps) {
  return (
    <div className={styles.MyChaptersPanel}>
      <Heading size="mediumLarge" className={styles.Title}>
        {title}
      </Heading>
      <div className={styles.Links}>
        {items.map(({ id, to, Icon, title, target }) => {
          return (
            <MainNavSubmenuLink key={id} to={to} id={id} target={target}>
              {Icon && <Icon aria-hidden="true" />}
              {title}
            </MainNavSubmenuLink>
          );
        })}
      </div>
      {isLoading && (
        <LoadingContent
          className={styles.LoadingContent}
          barConfig={[
            ['4rem', '4rem', '1rem'],
            ['auto', '2rem', '0'],
            ['4rem', '4rem', '1rem'],
            ['auto', '2rem', '0'],
          ]}
        />
      )}
    </div>
  );
}
