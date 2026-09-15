import { useMemo } from 'react';

import type { GridColumnNumber } from '@amsterdam/design-system-react';
import { generatePath, useParams } from 'react-router';

import { MyTipsRoute } from './MyTips-routes.ts';
import { isError, isLoading } from '../../../universal/helpers/api.ts';
import { ErrorAlert } from '../../components/Alert/Alert.tsx';
import { PageContentCell, PageV2 } from '../../components/Page/Page.tsx';
import { PaginationV2 } from '../../components/Pagination/PaginationV2.tsx';
import { TipCard, tipCardColors } from '../../components/TipCard/TipCard.tsx';
import { useAppStateGetter } from '../../hooks/useAppStateStore.ts';
import { useAppStateNotifications } from '../../hooks/useNotifications.ts';

const PAGE_SIZE = 6;

export function MyTipsPage() {
  const { NOTIFICATIONS } = useAppStateGetter();
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

  const getStartColumn = (index: number): GridColumnNumber => {
    const value = (index % 2) * 6 + 1;
    return Math.min(Math.max(value, 1), 12) as GridColumnNumber;
  };

  return (
    <PageV2 heading="Mijn tips">
      {isError(NOTIFICATIONS) && (
        <PageContentCell>
          <ErrorAlert className="ams-mb-m">
            Niet alle tips kunnen op dit moment worden getoond.
          </ErrorAlert>
        </PageContentCell>
      )}
      {!isLoading(NOTIFICATIONS) &&
        tipsPaginated?.map((tip, index) => (
          <PageContentCell
            key={tip.themaID}
            spanWide={6}
            startWide={getStartColumn(index)}
          >
            <TipCard
              backgroundColor={tipCardColors[index % tipCardColors.length]}
              description={tip.description}
              heading={tip.title}
              link={tip.link}
              tipReason={tip.tipReason}
            />
          </PageContentCell>
        ))}
      {tipsTotal != null && tipsTotal > PAGE_SIZE && (
        <PageContentCell>
          <PaginationV2
            className="ams-mb-m"
            totalCount={tipsTotal}
            pageSize={PAGE_SIZE}
            path={generatePath(MyTipsRoute.route)}
            currentPage={currentPage}
          />
        </PageContentCell>
      )}
    </PageV2>
  );
}
