import classNames from 'classnames';
import React from 'react';
import { useHistory } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config';
import { ChapterTitles } from '../../../universal/config/chapter';
import { defaultDateFormat, isInteralUrl } from '../../../universal/helpers';
import {
  MyNotification as MyNotificationBase,
  SVGComponent,
} from '../../../universal/types';
import { Colors } from '../../config/app';
import {
  trackItemClick,
  trackItemPresentation,
  useSessionCallbackOnceDebounced,
} from '../../hooks/analytics.hook';
import Linkd from '../Button/Button';
import ChapterIcon from '../ChapterIcon/ChapterIcon';
import { DocumentLink } from '../DocumentList/DocumentList';
import Heading from '../Heading/Heading';
import LoadingContent from '../LoadingContent/LoadingContent';
import styles from './MyNotifications.module.scss';

export interface MyNotificationsProps {
  items: MyNotification[];
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
  showMoreLink = false,
  isLoading = true,
  trackCategory,
  noContentNotification = 'Er zijn op dit moment geen updates voor u.',
  ...otherProps
}: MyNotificationsProps) {
  const history = useHistory();

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
          items.map((item) => {
            const isLinkExternal =
              (!!item.link?.to && !isInteralUrl(item.link.to)) ||
              !!item.link?.download;
            return (
              <li
                key={`${item.chapter}-${item.id}`}
                className={styles.MyNotificationItem}
              >
                <Heading className={styles.Title} el="h4" size="small">
                  {item.title}
                </Heading>
                <aside className={styles.MetaInfo}>
                  {!item.Icon ? (
                    <ChapterIcon
                      fill={Colors.primaryRed}
                      className={styles.Icon}
                      chapter={item.isAlert ? 'ALERT' : item.chapter}
                    />
                  ) : (
                    <item.Icon className={styles.Icon} />
                  )}
                  <div className={styles.MetaInfoSecondary}>
                    <em className={styles.ChapterIndication}>
                      {ChapterTitles[item.chapter]}
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
                    {item.link?.download ? (
                      <DocumentLink
                        document={{
                          id: item.id,
                          title: item.title,
                          datePublished: item.datePublished,
                          url: item.link.to,
                          download: item.link.download,
                          type: 'PDF',
                        }}
                        label={item.link.title}
                      />
                    ) : (
                      <Linkd
                        title={`Meer informatie over de melding: ${item.title}`}
                        href={item.customLink ? '#' : item.link?.to}
                        external={isLinkExternal}
                        onClick={() => {
                          trackItemClick(trackCategory, item.title);
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
                          'Meer informatie over ' + item.title}
                      </Linkd>
                    )}
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
          <Linkd href={AppRoutes.NOTIFICATIONS}>Alle updates</Linkd>
        </p>
      )}
    </div>
  );
}
