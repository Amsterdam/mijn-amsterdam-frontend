import { useEffect, useMemo } from 'react';

import { OrderedList } from '@amsterdam/design-system-react';
import { generatePath, useHistory, useParams } from 'react-router-dom';

import styles from './MyNotifications.module.scss';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import {
  ErrorAlert,
  ThemaIcon,
  DetailPage,
  PageContent,
  PageHeading,
  Pagination,
  LoadingContent,
} from '../../components';
import { MyNotification } from '../../components/MyNotification/MyNotification';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useAppStateNotifications } from '../../hooks/useNotifications';

const PAGE_SIZE = 12;

export function MyNotificationsPage() {
  const { NOTIFICATIONS } = useAppStateGetter();
  const { notifications, total } = useAppStateNotifications();
  const { page = '1' } = useParams<{ page?: string }>();
  const history = useHistory();

  const currentPage = useMemo(() => {
    if (!page) {
      return 1;
    }
    return parseInt(page, 10);
  }, [page]);

  const notificationsPaginated = useMemo(() => {
    const startIndex = currentPage - 1;
    const start = startIndex * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return notifications.slice(start, end);
  }, [currentPage, notifications]);

  useEffect(() => {
    window.scrollBy({
      top: -document.documentElement.scrollTop,
      left: 0,
      behavior: 'smooth',
    });
  }, [currentPage]);

  return (
    <DetailPage className={styles.MyNotifications}>
      <PageHeading
        backLink={{
          to: AppRoutes.HOME,
          title: 'Home',
        }}
        className={styles.MainHeader}
        icon={<ThemaIcon />}
      >
        Actueel
      </PageHeading>
      <PageContent>
        {isError(NOTIFICATIONS) && (
          <ErrorAlert>
            Niet alle updates kunnen op dit moment worden getoond.
          </ErrorAlert>
        )}
      </PageContent>
      {total > PAGE_SIZE && (
        <PageContent>
          <Pagination
            className={styles.Pagination}
            totalCount={total}
            pageSize={PAGE_SIZE}
            currentPage={currentPage}
            onPageClick={(page) => {
              history.replace(generatePath(AppRoutes.NOTIFICATIONS, { page }));
            }}
          />
        </PageContent>
      )}
      <OrderedList markers={false}>
        {isLoading(NOTIFICATIONS) && (
          <OrderedList.Item>
            <LoadingContent />
          </OrderedList.Item>
        )}
        {!isLoading(NOTIFICATIONS) &&
          notificationsPaginated.map((notification, index) => {
            return (
              <OrderedList.Item
                key={`${notification.thema}-${notification.id}-${index}`}
                className={styles.MyNotificationItem}
              >
                <MyNotification
                  notification={notification}
                  trackCategory="Dashboard / Actueel"
                  smallVariant={true}
                />
              </OrderedList.Item>
            );
          })}
      </OrderedList>
      {total > PAGE_SIZE && (
        <PageContent>
          <Pagination
            className={styles.Pagination}
            totalCount={total}
            pageSize={PAGE_SIZE}
            currentPage={currentPage}
            onPageClick={(page) => {
              history.replace(generatePath(AppRoutes.NOTIFICATIONS, { page }));
            }}
          />
        </PageContent>
      )}
    </DetailPage>
  );
}
