import { useMemo } from 'react';

import { OrderedList } from '@amsterdam/design-system-react';
import { generatePath, useParams } from 'react-router';

import { MY_NOTIFICATIONS_PAGE_DOCUMENT_TITLE } from './MyNotifications-config.ts';
import { MyNotificationsRoute } from './MyNotifications-routes.ts';
import { isError, isLoading } from '../../../universal/helpers/api.ts';
import ErrorAlert from '../../components/Alert/Alert.tsx';
import LoadingContent from '../../components/LoadingContent/LoadingContent.tsx';
import { MyNotification } from '../../components/MyNotification/MyNotification.tsx';
import {
  OverviewPageV2,
  PageContentCell,
  PageContentV2,
} from '../../components/Page/Page.tsx';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2.tsx';
import { PaginationV2 } from '../../components/Pagination/PaginationV2.tsx';
import { useAppStateGetter } from '../../hooks/useAppState.ts';
import { useHTMLDocumentTitle } from '../../hooks/useHTMLDocumentTitle.ts';
import { useAppStateNotifications } from '../../hooks/useNotifications.ts';
import { themaTitle } from './MyNotifications-config.ts';

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
    <OverviewPageV2>
      <PageContentV2>
        <PageHeadingV2>{themaTitle}</PageHeadingV2>
        <PageContentCell>
          {isError(NOTIFICATIONS) && (
            <ErrorAlert className="ams-mb-m">
              Niet alle berichten kunnen op dit moment worden getoond.
            </ErrorAlert>
          )}
          {total > PAGE_SIZE && (
            <PaginationV2
              className="ams-mb-m"
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
                    className="ams-mb-m"
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
      </PageContentV2>
    </OverviewPageV2>
  );
}
