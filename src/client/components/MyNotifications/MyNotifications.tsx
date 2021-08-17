import classNames from 'classnames';
import { generatePath, useHistory } from 'react-router-dom';
import { InnerHtml } from '..';
import { AppRoutes } from '../../../universal/config';
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
import { useChapterTitle } from '../../hooks/useChapterTitle';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import Linkd from '../Button/Button';
import ChapterIcon from '../ChapterIcon/ChapterIcon';
import { DocumentLink } from '../DocumentList/DocumentList';
import Heading from '../Heading/Heading';
import LoadingContent from '../LoadingContent/LoadingContent';
import styles from './MyNotifications.module.scss';

interface MyNotificationItemProps {
  notification: MyNotification;
  trackCategory: string;
}

function MyNotificationItem({
  notification,
  trackCategory,
}: MyNotificationItemProps) {
  const history = useHistory();
  const profileType = useProfileTypeValue();
  function showNotification(id: string, to: string) {
    history.push(to);
  }
  const isLinkExternal =
    (!!notification.link?.to && !isInteralUrl(notification.link.to)) ||
    !!notification.link?.download;
  const chapterTitle = useChapterTitle(notification.chapter);
  return (
    <>
      <Heading className={styles.Title} el="h4" size="small">
        {notification.title}
      </Heading>
      <aside className={styles.MetaInfo}>
        {!notification.Icon ? (
          <ChapterIcon
            fill={Colors.primaryRed}
            className={styles.Icon}
            chapter={notification.isAlert ? 'ALERT' : notification.chapter}
          />
        ) : (
          <notification.Icon className={styles.Icon} />
        )}
        <div className={styles.MetaInfoSecondary}>
          <em className={styles.ChapterIndication}>{chapterTitle}</em>
          {!notification.hideDatePublished && (
            <time
              className={styles.Datum}
              dateTime={notification.datePublished}
            >
              {defaultDateFormat(notification.datePublished)}
            </time>
          )}
        </div>
      </aside>
      <div className={styles.Body}>
        {!!notification.description && (
          <InnerHtml className={styles.Description}>
            {notification.description}
          </InnerHtml>
        )}
        {!!notification.moreInformation && (
          <InnerHtml className={styles.MoreInformation}>
            {notification.moreInformation}
          </InnerHtml>
        )}
        {(!!notification.link || !!notification.customLink) && (
          <p className={styles.Action}>
            {notification.link?.download ? (
              <DocumentLink
                document={{
                  id: notification.id,
                  title: notification.title,
                  datePublished: notification.datePublished,
                  url: notification.link.to,
                  download: notification.link.download,
                  type: 'pdf',
                }}
                label={notification.link.title}
              />
            ) : (
              <Linkd
                title={`Meer informatie over de melding: ${notification.title}`}
                href={notification.customLink ? '#' : notification.link?.to}
                external={isLinkExternal}
                onClick={() => {
                  trackItemClick(
                    trackCategory,
                    notification.title,
                    profileType
                  );
                  if (notification.customLink?.callback) {
                    notification.customLink.callback();
                    return false;
                  }
                  if (notification.link && !isLinkExternal) {
                    showNotification(notification.id, notification.link.to);
                    return false;
                  }
                }}
              >
                {(notification.link || notification.customLink)?.title ||
                  'Meer informatie over ' + notification.title}
              </Linkd>
            )}
          </p>
        )}
      </div>
    </>
  );
}

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
  const profileType = useProfileTypeValue();

  useSessionCallbackOnceDebounced(trackCategory, () =>
    trackItemPresentation(trackCategory, 'Aantal updates', profileType)
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
          items.map((item, index) => {
            return (
              <li
                key={`${item.chapter}-${item.id}-${index}`}
                className={styles.MyNotificationItem}
              >
                <MyNotificationItem
                  trackCategory={trackCategory}
                  notification={item}
                />
              </li>
            );
          })}
      </ul>
      {!isLoading && items.length === 0 && (
        <p className={styles.NoItemsInfo}>{noContentNotification}</p>
      )}
      {!isLoading && showMoreLink && (
        <p className={styles.FooterLink}>
          <Linkd href={generatePath(AppRoutes.NOTIFICATIONS)}>
            Alle updates
          </Linkd>
        </p>
      )}
    </div>
  );
}
