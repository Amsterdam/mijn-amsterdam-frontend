import classnames from 'classnames';
import { generatePath } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config';
import {
  trackItemPresentation,
  useSessionCallbackOnceDebounced,
} from '../../hooks/analytics.hook';
import { useProfileTypeValue } from '../../hooks/useProfileType';
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
  const profileType = useProfileTypeValue();

  useSessionCallbackOnceDebounced(trackCategory, () =>
    trackItemPresentation(trackCategory, 'Aantal updates', profileType)
  );

  return (
    <div
      {...otherProps}
      className={classnames(styles.MyNotifications, styles.isLoading, {
        [styles.MarginBottomMobile]: !showMoreLink,
      })}
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
                key={`${item.chapter}-${item.id}-${index}`}
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
