import { useMemo } from 'react';

import { OrderedList, Paragraph } from '@amsterdam/design-system-react';
import { generatePath, useParams } from 'react-router';

import { MY_TIPS_PAGE_DOCUMENT_TITLE } from './MyTips-config.ts';
import { MyTipsRoute } from './MyTips-routes.ts';
import { isError } from '../../../../../universal/helpers/api.ts';
import { ErrorAlert } from '../../../../components/Alert/Alert.tsx';
import { LoadingContent } from '../../../../components/LoadingContent/LoadingContent.tsx';
import { MyNotification } from '../../../../components/MyNotification/MyNotification.tsx';
import { PageContentCell, PageV2 } from '../../../../components/Page/Page.tsx';
import { PaginationV2 } from '../../../../components/Pagination/PaginationV2.tsx';
import { useAppStateGetter } from '../../../../hooks/useAppStateStore.ts';
import { useHTMLDocumentTitle } from '../../../../hooks/useHTMLDocumentTitle.ts';
import { useIsLoading } from '../../../../hooks/useIsLoading.ts';
import { useAppStateNotifications } from '../../../../hooks/useNotifications.ts';

const PAGE_SIZE = 12;

export function MyTipsPage() {
  useHTMLDocumentTitle({
    documentTitle: MY_TIPS_PAGE_DOCUMENT_TITLE,
  });

  const { NOTIFICATIONS } = useAppStateGetter();
  const isNotificationsLoading = useIsLoading(NOTIFICATIONS);
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
        {isError(NOTIFICATIONS) && (
          <ErrorAlert className="ams-mb-m">
            Niet alle tips kunnen op dit moment worden getoond.
          </ErrorAlert>
        )}
        <OrderedList markers={false}>
          {isNotificationsLoading && (
            <OrderedList.Item>
              <LoadingContent />
            </OrderedList.Item>
          )}
          {!isNotificationsLoading &&
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
        {!isNotificationsLoading && tips?.length === 0 && (
          <Paragraph>Op dit moment zijn er geen tips.</Paragraph>
        )}
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
