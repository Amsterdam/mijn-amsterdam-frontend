import { AppRoutes, Colors } from '../../../universal/config';
import { defaultDateFormat, isInteralUrl } from '../../../universal/helpers';
import {
  trackItemPresentation,
  useSessionCallbackOnceDebounced,
} from '../../hooks/analytics.hook';

import ChapterIcon from '../ChapterIcon/ChapterIcon';
import Heading from '../Heading/Heading';
import Linkd from '../Button/Button';
import LoadingContent from '../LoadingContent/LoadingContent';
import { MyNotification as MyNotificationBase } from '../../../server/services/services-notifications';
import React from 'react';
import { SVGComponent } from '../../../universal/types/App.types';
import classNames from 'classnames';
import styles from './MyNotifications.module.scss';
import useRouter from 'use-react-router';

export interface MyNotificationsProps {
  items: MyNotification[];
  total: number;
  showMoreLink?: boolean;
  isLoading?: boolean;
  trackCategory: string;
  noContentNotification?: string;
}

interface MyNotification extends MyNotificationBase {
  Icon?: SVGComponent;
}

export default function MyNotifications({
  items = [],
  total = 0,
  showMoreLink = false,
  isLoading = true,
  trackCategory,
  noContentNotification = 'Er zijn op dit moment geen updates voor u.',
  ...otherProps
}: MyNotificationsProps) {
  const { history } = useRouter();

  function showNotification(id: string, to: string) {
    history.push(to);
  }

  useSessionCallbackOnceDebounced(trackCategory, () =>
    trackItemPresentation(trackCategory, 'Aantal updates', items.length)
  );

  return (
    <div
      {...otherProps}
      className={classNames(styles.MyNotifications, styles.isLoading)}
    >
      <ul>
        {isLoading && (
          <li
            className={classNames(
              styles.MyNotificationItem,
              styles.FakeContent
            )}
          >
            <LoadingContent />
          </li>
        )}
        {!isLoading &&
          items.map(item => {
            const isLinkExternal =
              (!!item.link?.to && !isInteralUrl(item.link.to)) ||
              !!item.link?.download;
            return (
              <li
                key={item.id}
                className={classNames(
                  styles.MyNotificationItem,
                  item.isUnread && styles.isUnread
                )}
              >
                <Heading className={styles.Title} el="h4" size="small">
                  {item.title}
                </Heading>
                <aside className={styles.MetaInfo}>
                  {!item.Icon ? (
                    <ChapterIcon
                      fill={Colors.primaryRed}
                      className={styles.Icon}
                      chapter={item.chapter}
                    />
                  ) : (
                    <item.Icon className={styles.Icon} />
                  )}
                  <div className={styles.MetaInfoSecondary}>
                    <em className={styles.ChapterIndication}>
                      {item.chapter.toLowerCase()}
                    </em>
                    {!item.hideDatePublished && (
                      <time
                        className={styles.Datum}
                        dateTime={item.datePublished}
                      >
                        {defaultDateFormat(item.datePublished)}
                      </time>
                    )}
                  </div>
                </aside>
                {!!item.description && (
                  <p className={styles.Description}>{item.description}</p>
                )}
                {(!!item.link || !!item.customLink) && (
                  <p className={styles.Action}>
                    <Linkd
                      title={`Meer informatie over de melding: ${item.title}`}
                      href={item.customLink ? '#' : item.link?.to}
                      external={isLinkExternal}
                      download={item.link?.download}
                      onClick={event => {
                        if (item.customLink) {
                          item.customLink.callback();
                          return false;
                        }
                        if (item.link && !isLinkExternal) {
                          showNotification(item.id, item.link.to);
                          return false;
                        }
                      }}
                    >
                      {(item.link || item.customLink)?.title ||
                        'Meer informatie'}
                    </Linkd>
                  </p>
                )}
              </li>
            );
          })}
      </ul>
      {!isLoading && items.length === 0 && (
        <p className={styles.NoItemsInfo}>{noContentNotification}</p>
      )}
      {!isLoading && showMoreLink && (
        <p className={styles.FooterLink}>
          <Linkd href={AppRoutes.UPDATES}>Alle meldingen</Linkd>
        </p>
      )}
    </div>
  );
}
