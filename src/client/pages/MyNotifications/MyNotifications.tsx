import { useMemo } from 'react';

import { OrderedList } from '@amsterdam/design-system-react';
import { generatePath, useParams } from 'react-router';

import { MY_NOTIFICATIONS_PAGE_DOCUMENT_TITLE } from './MyNotifications-config';
import { themaTitle } from './MyNotifications-config';
import { MyNotificationsRoute } from './MyNotifications-routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import ErrorAlert from '../../components/Alert/Alert';
import LoadingContent from '../../components/LoadingContent/LoadingContent';
import { MyNotification } from '../../components/MyNotification/MyNotification';
import { PageContentCell, PageV2 } from '../../components/Page/Page';
import { PaginationV2 } from '../../components/Pagination/PaginationV2';
import { useAppStateGetter } from '../../hooks/useAppStateStore';
import { useHTMLDocumentTitle } from '../../hooks/useHTMLDocumentTitle';
import { useAppStateNotifications } from '../../hooks/useNotifications';

const PAGE_SIZE = 12;

export function MyNotificationsPage() {
  useHTMLDocumentTitle({
    documentTitle: MY_NOTIFICATIONS_PAGE_DOCUMENT_TITLE,
  });

  const { NOTIFICATIONS } = useAppStateGetter();
  const { notifications, total } = useAppStateNotifications();
  const { page = '1' } = useParams<{ page?: string }>();

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

  return (
    <PageV2 heading={themaTitle}>
      <PageContentCell>
        {isError(NOTIFICATIONS) && (
          <ErrorAlert className="ams-mb-m">
            Niet alle berichten kunnen op dit moment worden getoond.
          </ErrorAlert>
        )}
        {total > PAGE_SIZE && (
          <PaginationV2
            className="ams-mb-l"
            totalCount={total}
            pageSize={PAGE_SIZE}
            path={generatePath(MyNotificationsRoute.route)}
            currentPage={currentPage}
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
                  key={`${notification.themaID}-${notification.id}-${index}`}
                  className={`ams-mb-l ${notification.className}`}
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
            path={generatePath(MyNotificationsRoute.route)}
            currentPage={currentPage}
          />
        )}
      </PageContentCell>
    </PageV2>
  );
}
