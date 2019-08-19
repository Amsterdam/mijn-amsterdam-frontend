import { AppRoutes, Colors } from 'App.constants';
import classnames from 'classnames';
import ButtonLink from 'components/ButtonLink/ButtonLink';
import ButtonLinkStyles from 'components/ButtonLink/ButtonLink.module.scss';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import Heading from 'components/Heading/Heading';
import LoadingContent from 'components/LoadingContent/LoadingContent';
import { defaultDateFormat } from 'helpers/App';
import {
  MyNotification,
  useMyNotificationsState,
} from 'hooks/api/my-notifications-api.hook';
import { itemClickPayload, trackItemPresentation } from 'hooks/analytics.hook';
import React, { useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import useRouter from 'use-react-router';

import styles from './MyNotifications.module.scss';

export interface MyNotificationsProps {
  items: MyNotification[];
  total: number;
  showMoreLink?: boolean;
  isLoading?: boolean;
  trackCategory?: string;
  noContentNotification?: string;
}

const CATEGORY = 'Mijn_Meldingen';

export default function MyNotifications({
  items = [],
  total = 0,
  showMoreLink = false,
  isLoading = true,
  trackCategory = CATEGORY,
  noContentNotification = 'Er zijn op dit moment geen meldingen voor u.',
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

  const [trackEventPayload] = useDebouncedCallback(
    () => {
      trackItemPresentation(trackCategory, 'Aantal', '' + items.length);
    },
    1000,
    [items.length]
  );

  trackEventPayload();

  return (
    <div className={classnames(styles.MyNotifications, styles.isLoading)}>
      <ul>
        {isLoading && (
          <li
            className={classnames(
              styles.MyNotificationItem,
              styles.FakeContent
            )}
          >
            <LoadingContent />
          </li>
        )}
        {!isLoading &&
          items.map(item => {
            return (
              <li
                key={item.id}
                className={classnames(
                  styles.MyNotificationItem,
                  item.isUnread && styles.isUnread
                )}
              >
                <ChapterIcon
                  fill={Colors.primaryRed}
                  className={styles.Icon}
                  chapter={item.chapter}
                />
                <Heading className={styles.Title} el="h4" size="small">
                  {item.title}
                </Heading>
                <aside className={styles.MetaInfo}>
                  <em className={styles.ChapterIndication}>
                    {item.chapter.toLowerCase()}
                  </em>
                  <time className={styles.Datum} dateTime={item.datePublished}>
                    {defaultDateFormat(item.datePublished)}
                  </time>
                </aside>
                {!!item.description && (
                  <p className={styles.Description}>{item.description}</p>
                )}
                {(!!item.link || !!item.customLink) && (
                  <p className={styles.Action}>
                    <a
                      href={item.customLink ? '#' : item.link!.to}
                      role="button"
                      data-track={itemClickPayload(
                        `${trackCategory}/Melding`,
                        'Link_naar_meer_info'
                      )}
                      className={ButtonLinkStyles.ButtonLink}
                      onClick={event => {
                        event.preventDefault();
                        if (item.customLink) {
                          item.customLink.callback();
                        }
                        if (item.link) {
                          showNotification(item.id, item.link.to);
                        }
                        return false;
                      }}
                    >
                      {(item.link || item.customLink)!.title}
                    </a>
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
          <ButtonLink
            to={AppRoutes.MY_NOTIFICATIONS}
            data-track={itemClickPayload(
              trackCategory,
              'Link_naar_alle_meldingen'
            )}
          >
            Alle meldingen
          </ButtonLink>
        </p>
      )}
    </div>
  );
}
