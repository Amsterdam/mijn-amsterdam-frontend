import { useEffect, useMemo } from 'react';

import { OrderedList } from '@amsterdam/design-system-react';
import classNames from 'classnames';
import { generatePath, useHistory, useParams } from 'react-router-dom';

import styles from './MyNotifications.module.scss';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ErrorAlert, Pagination, LoadingContent } from '../../components';
import { MyNotification } from '../../components/MyNotification/MyNotification';
import {
  DetailPageV2,
  PageContentCell,
  PageContentV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
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
    <DetailPageV2 className={styles.MyNotifications}>
      <PageContentV2>
        <PageHeadingV2 backLink={AppRoutes.HOME}>Actueel</PageHeadingV2>
        <PageContentCell>
          {isError(NOTIFICATIONS) && (
            <ErrorAlert>
              Niet alle updates kunnen op dit moment worden getoond.
            </ErrorAlert>
          )}
          {total > PAGE_SIZE && (
            <Pagination
              className={styles.Pagination}
              totalCount={total}
              pageSize={PAGE_SIZE}
              currentPage={currentPage}
              onPageClick={(page) => {
                history.replace(
                  generatePath(AppRoutes.NOTIFICATIONS, { page })
                );
              }}
            />
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
                    className={classNames(
                      styles.MyNotificationItem,
                      'ams-mb--sm'
                    )}
                  >
                    <MyNotification
                      notification={notification}
                      trackCategory="Dashboard / Actueel"
                    />
                  </OrderedList.Item>
                );
              })}
          </OrderedList>
          {total > PAGE_SIZE && (
            <Pagination
              className={styles.Pagination}
              totalCount={total}
              pageSize={PAGE_SIZE}
              currentPage={currentPage}
              onPageClick={(page) => {
                history.replace(
                  generatePath(AppRoutes.NOTIFICATIONS, { page })
                );
              }}
            />
          )}
        </PageContentCell>
      </PageContentV2>
    </DetailPageV2>
  );
}
