import classnames from 'classnames';
import { generatePath, Link } from 'react-router-dom';

import styles from './MyNotifications.module.scss';
import Notification, { MyNotification } from './Notification';
import { AppRoutes } from '../../../universal/config/routes';
import LoadingContent from '../LoadingContent/LoadingContent';
import { MaRouterLink } from '../MaLink/MaLink';

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
          <MaRouterLink href={generatePath(AppRoutes.NOTIFICATIONS)}>
            Alle updates
          </MaRouterLink>
        </p>
      )}
    </div>
  );
}
