import React from 'react';
import styles from './MyChaptersPanel.module.scss';
import { MainNavSubmenuLink } from 'components/MainNavSubmenu/MainNavSubmenu';
import Heading from 'components/Heading/Heading';
import { MenuItem } from '../MainNavBar/MainNavBar.constants';
import LoadingContent from 'components/LoadingContent/LoadingContent';
import classnames from 'classnames';
import {
  trackItemPresentation,
  useSessionCallbackOnceDebounced,
} from 'hooks/analytics.hook';
import { ChapterTitles, Chapter } from 'App.constants';
import { useLastVisitedChapter } from 'hooks/api/myChapters.hook';

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
  className,
  isLoading = true,
  trackCategory,
  ...otherProps
}: MyChaptersPanelProps) {
  const [lastVisitedChapter, setLastVisitedChapter] = useLastVisitedChapter();
  useSessionCallbackOnceDebounced(
    trackCategory,
    () => {
      items.forEach(({ id }) => {
        trackItemPresentation(
          trackCategory,
          `Thema ${ChapterTitles[id as Chapter] || id}`
        );
      });
    },
    items.length
  );

  return (
    <div
      {...otherProps}
      className={classnames(styles.MyChaptersPanel, className)}
    >
      <Heading size="large" className={styles.Title}>
        {title}
      </Heading>
      <div className={styles.Links}>
        {items.map(({ id, to, Icon, title, rel }) => {
          return (
            <MainNavSubmenuLink
              onClick={() => setLastVisitedChapter(id)}
              key={id}
              to={to}
              rel={rel}
              className={
                lastVisitedChapter === id ? styles.LastVisitedChapter : ''
              }
            >
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
