import { useEffect, useMemo } from 'react';

import { OrderedList } from '@amsterdam/design-system-react';
import { generatePath, useNavigate, useParams } from 'react-router';

import { MyNotificationsRoute } from './MyNotifications-routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import ErrorAlert from '../../components/Alert/Alert';
import LoadingContent from '../../components/LoadingContent/LoadingContent';
import { MyNotification } from '../../components/MyNotification/MyNotification';
import {
  OverviewPageV2,
  PageContentCell,
  PageContentV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { PaginationV2 } from '../../components/Pagination/PaginationV2';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useAppStateNotifications } from '../../hooks/useNotifications';

const PAGE_SIZE = 12;

export function MyNotificationsPage() {
  const { NOTIFICATIONS } = useAppStateGetter();
  const { notifications, total } = useAppStateNotifications();
  const { page = '1' } = useParams<{ page?: string }>();
  const navigate = useNavigate();

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
    <OverviewPageV2>
      <PageContentV2>
        <PageHeadingV2>Actueel</PageHeadingV2>
        <PageContentCell>
          {isError(NOTIFICATIONS) && (
            <ErrorAlert className="ams-mb--sm">
              Niet alle updates kunnen op dit moment worden getoond.
            </ErrorAlert>
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
                    key={`${notification.themaID}-${notification.id}-${index}`}
                    className="ams-mb--sm"
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
            <PaginationV2
              totalCount={total}
              pageSize={PAGE_SIZE}
              onPageClick={(page) => {
                navigate(
                  generatePath(MyNotificationsRoute.route, { page: `${page}` })
                );
              }}
              currentPage={currentPage}
            />
          )}
        </PageContentCell>
      </PageContentV2>
    </OverviewPageV2>
  );
}
