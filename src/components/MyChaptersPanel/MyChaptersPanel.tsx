import React from 'react';
import styles from './MyChaptersPanel.module.scss';
import { MainNavSubmenuLink } from 'components/MainNavSubmenu/MainNavSubmenu';
import Heading from 'components/Heading/Heading';
import { MenuItem } from '../MainNavBar/MainNavBar.constants';
import LoadingContent from 'components/LoadingContent/LoadingContent';
import {
  trackItemPresentation,
  useSessionCallbackOnceDebounced,
} from 'hooks/analytics.hook';
import { ChapterTitles, Chapter } from 'App.constants';
import Panel from '../Panel/Panel';
import { useDebounce } from 'use-debounce';

export interface MyChaptersPanelProps {
  title: string;
  items: MenuItem[];
  isLoading: boolean;
  trackCategory: string;
  className?: string;
}

export default function MyChaptersPanel({
  title,
  items = [],
  isLoading = true,
  trackCategory,
  ...otherProps
}: MyChaptersPanelProps) {
  // Use debounced value here because we want to avoid dependent loading flickr in the scenario: Api A done and Api B started request with data returned from B.
  const [isLoadingDebounced] = useDebounce(isLoading, 200);
  useSessionCallbackOnceDebounced(trackCategory, () => {
    items.forEach(({ id }) => {
      trackItemPresentation(
        trackCategory,
        `Thema ${ChapterTitles[id as Chapter] || id}`
      );
    });
  });

  return (
    <Panel {...otherProps} className={styles.MyChaptersPanel}>
      <Heading size="large" className={styles.Title}>
        {title}
      </Heading>
      <div className={styles.Links}>
        {items.map(({ id, to, Icon, title, rel }) => {
          return (
            <MainNavSubmenuLink data-chapter-id={id} key={id} to={to} rel={rel}>
              {Icon && <Icon aria-hidden="true" />}
              {title}
            </MainNavSubmenuLink>
          );
        })}
      </div>
      {isLoadingDebounced && (
        <LoadingContent
          className={styles.LoadingContent}
          barConfig={[
            ['3.4rem', '3.4rem', '1rem'],
            ['auto', '1.6rem', '0'],
            ['3.4rem', '3.4rem', '1rem'],
            ['auto', '1.6rem', '0'],
          ]}
        />
      )}
    </Panel>
  );
}
