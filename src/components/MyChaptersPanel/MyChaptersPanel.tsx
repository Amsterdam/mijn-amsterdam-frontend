import React from 'react';
import styles from './MyChaptersPanel.module.scss';
import { MainNavSubmenuLink } from 'components/MainNavSubmenu/MainNavSubmenu';
import Heading from 'components/Heading/Heading';
import { MenuItem } from '../MainNavBar/MainNavBar.constants';
import LoadingContent from 'components/LoadingContent/LoadingContent';
import { useDebouncedCallback } from 'use-debounce';
import {
  trackItemPresentation,
  useSessionCallbackOnceDebounced,
} from 'hooks/analytics.hook';
import { useSessionStorage } from 'hooks/storage.hook';

export interface MyChaptersPanelProps {
  title: string;
  items: MenuItem[];
  isLoading: boolean;
  trackCategory: string;
}

export default function MyChaptersPanel({
  title,
  items = [],
  isLoading = true,
  trackCategory,
}: MyChaptersPanelProps) {
  useSessionCallbackOnceDebounced(
    trackCategory,
    () => {
      items.forEach(({ id }) => {
        trackItemPresentation(trackCategory, `Thema ${id}`);
      });
    },
    items.length
  );

  return (
    <div className={styles.MyChaptersPanel}>
      <Heading
        id="MyChaptersHeader" // Used for tutorial placement
        size="large"
        className={styles.Title}
      >
        {title}
      </Heading>
      <div className={styles.Links}>
        {items.map(({ id, to, Icon, title, rel }) => {
          return (
            <MainNavSubmenuLink key={id} to={to} rel={rel}>
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
