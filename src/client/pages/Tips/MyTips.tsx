import { useMemo } from 'react';

import { OrderedList } from '@amsterdam/design-system-react';
import { generatePath, useParams } from 'react-router';

import { MyTipsRoute } from './MyTips-routes.ts';
import { isError, isLoading } from '../../../universal/helpers/api.ts';
import { ErrorAlert } from '../../components/Alert/Alert.tsx';
import { LoadingContent } from '../../components/LoadingContent/LoadingContent.tsx';
import { MyNotification } from '../../components/MyNotification/MyNotification.tsx';
import { PageContentCell, PageV2 } from '../../components/Page/Page.tsx';
import { PaginationV2 } from '../../components/Pagination/PaginationV2.tsx';
import { useAppStateGetter } from '../../hooks/useAppStateStore.ts';
import { useAppStateNotifications } from '../../hooks/useNotifications.ts';

const PAGE_SIZE = 12;

export function MyTipsPage() {
  const { NOTIFICATIONS: TIPS } = useAppStateGetter();
  const { tips, tipsTotal } = useAppStateNotifications();
  const { page = '1' } = useParams<{ page?: string }>();

  const currentPage = useMemo(() => {
    if (!page) {
      return 1;
    }
    return parseInt(page, 10);
  }, [page]);

  const tipsPaginated = useMemo(() => {
    const startIndex = currentPage - 1;
    const start = startIndex * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return tips?.slice(start, end);
  }, [currentPage, tips]);

  return (
    <PageV2 heading="Mijn tips">
      <PageContentCell>
        {isError(TIPS) && (
          <ErrorAlert className="ams-mb-m">
            Niet alle tips kunnen op dit moment worden getoond.
          </ErrorAlert>
        )}
        <OrderedList markers={false}>
          {isLoading(TIPS) && (
            <OrderedList.Item>
              <LoadingContent />
            </OrderedList.Item>
          )}
          {!isLoading(TIPS) &&
            tipsPaginated?.map((tip, index) => {
              return (
                <OrderedList.Item
                  key={`${tip.themaID}-${tip.id}-${index}`}
                  className="ams-mb-m"
                >
                  <MyNotification
                    notification={tip}
                    trackCategory="Dashboard / Actueel"
                  />
                </OrderedList.Item>
              );
            })}
        </OrderedList>
        {tipsTotal != null && tipsTotal > PAGE_SIZE && (
          <PaginationV2
            className="ams-mb-m"
            totalCount={tipsTotal}
            pageSize={PAGE_SIZE}
            path={generatePath(MyTipsRoute.route)}
            currentPage={currentPage}
          />
        )}
      </PageContentCell>
    </PageV2>
  );
}
