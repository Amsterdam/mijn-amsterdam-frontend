import {
  MyNotification,
  useMyNotificationsState,
} from 'hooks/api/my-notifications-api.hook';
import {
  trackItemPresentation,
  useSessionCallbackOnceDebounced,
} from 'hooks/analytics.hook';

import { AppRoutes } from 'config/Routing.constants';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { Colors } from 'config/App.constants';
import Heading from 'components/Heading/Heading';
import Linkd from 'components/Button/Button';
import LoadingContent from 'components/LoadingContent/LoadingContent';
import React from 'react';
import classNames from 'classnames';
import { defaultDateFormat } from 'helpers/App';
import { isInteralUrl } from 'helpers/App';
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

export default function MyNotifications({
  items = [],
  total = 0,
  showMoreLink = false,
  isLoading = true,
  trackCategory,
  noContentNotification = 'Er zijn op dit moment geen updates voor u.',
  ...otherProps
}: MyNotificationsProps) {
  const [
    myNotificationsState,
    setMyNotificationsState,
  ] = useMyNotificationsState();
  const { history } = useRouter();

  function showNotification(id: string, to: string) {
    setMyNotificationsState({
      ...myNotificationsState,
      [id]: true,
    });
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
                    <time
                      className={styles.Datum}
                      dateTime={item.datePublished}
                    >
                      {defaultDateFormat(item.datePublished)}
                    </time>
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
                        'Meer informatie'}{' '}
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
          <Linkd href={AppRoutes.MELDINGEN}>Alle updates</Linkd>
        </p>
      )}
    </div>
  );
}
