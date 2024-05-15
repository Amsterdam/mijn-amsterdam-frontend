import { generatePath } from 'react-router-dom';
import classnames from 'classnames';
import { AppRoutes } from '../../../universal/config';
import Linkd from '../Button/Button';
import LoadingContent from '../LoadingContent/LoadingContent';
import styles from './MyNotifications.module.scss';
import Notification, { MyNotification } from './Notification';

export interface MyNotificationsProps {
  items: MyNotification[];
  showMoreLink?: boolean;
  isLoading?: boolean;
  trackCategory: string;
  noContentNotification?: string;
  isEmbedded?: boolean;
}

export default function MyNotifications({
  items = [],
  showMoreLink = false,
  isLoading = true,
  trackCategory,
  noContentNotification = 'Er zijn op dit moment geen updates voor u.',
  isEmbedded = false,
  ...otherProps
}: MyNotificationsProps) {
  return (
    <div
      {...otherProps}
      className={classnames(styles.MyNotifications, styles.isLoading)}
    >
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
          items.map((item, index) => {
            return (
              <li
                key={`${item.thema}-${item.id}-${index}`}
                className={styles.MyNotificationItem}
              >
                <Notification
                  notification={item}
                  trackCategory={trackCategory}
                  smallVariant={isEmbedded}
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
