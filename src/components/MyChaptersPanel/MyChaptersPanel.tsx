import React from 'react';
import styles from './MyChaptersPanel.module.scss';
import { MainNavSubmenuLink } from 'components/MainNavSubmenu/MainNavSubmenu';
import Heading from 'components/Heading/Heading';
import { MenuItem } from '../MainNavBar/MainNavBar.constants';
import LoadingContent from 'components/LoadingContent/LoadingContent';
import { itemClickPayload } from 'hooks/matomo.hook';
import { useDebouncedCallback } from 'use-debounce';
import { trackItemPresentation } from 'hooks/matomo.hook';

export interface MyChaptersPanelProps {
  title: string;
  items: MenuItem[];
  isLoading: boolean;
  trackCategory?: string;
}

const CATEGORY = 'MA_Dashboard/Mijn_Themas';

export default function MyChaptersPanel({
  title,
  items = [],
  isLoading = true,
  trackCategory = CATEGORY,
}: MyChaptersPanelProps) {
  const [trackEventPayload] = useDebouncedCallback(
    () => {
      items.forEach(({ id }) => {
        trackItemPresentation(trackCategory, `Link_naar_Thema_${id}`);
      });
    },
    1000,
    [items.length]
  );

  trackEventPayload();

  return (
    <div className={styles.MyChaptersPanel}>
      <Heading size="large" className={styles.Title}>
        {title}
      </Heading>
      <div className={styles.Links}>
        {items.map(({ id, to, Icon, title, target }) => {
          return (
            <MainNavSubmenuLink
              data-track={itemClickPayload(CATEGORY, `Link_naar_Thema_${id}`)}
              key={id}
              to={to}
              id={id}
              target={target}
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
