import { Chapter, ChapterTitles } from '../../../universal/config';
import {
  trackItemPresentation,
  useSessionCallbackOnceDebounced,
} from '../../hooks/analytics.hook';

import Heading from '../Heading/Heading';
import LoadingContent from '../LoadingContent/LoadingContent';
import { MainNavSubmenuLink } from '../MainNavSubmenu/MainNavSubmenu';
import Panel from '../Panel/Panel';
import React from 'react';
import styles from './MyChaptersPanel.module.scss';
import { useDebounce } from 'use-debounce';
import { MenuItem } from '../../config/menuItems';
import { ChapterIcons } from '../../config/chapterIcons';

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
        {items.map(({ id, to, title, rel, chapter }) => {
          return (
            <MainNavSubmenuLink
              data-chapter-id={id}
              key={id}
              to={to}
              rel={rel}
              title={title}
              Icon={chapter ? ChapterIcons[chapter] : undefined}
            />
          );
        })}
      </div>
      {isLoadingDebounced && (
        <LoadingContent
          className={styles.LoadingPlaceholder}
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
