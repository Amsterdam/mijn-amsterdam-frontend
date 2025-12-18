import { ReactNode, useMemo } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';
import { useParams } from 'react-router';

import {
  LinkProps,
  ZaakAanvraagDetail,
} from '../../../universal/types/App.types';
import { usePageTypeSetting } from '../../hooks/useThemaMenuItems';
import ErrorAlert from '../Alert/Alert';
import LoadingContent from '../LoadingContent/LoadingContent';
import { PageContentCell, PageV2 } from '../Page/Page';
import { PaginationV2 } from '../Pagination/PaginationV2';
import { DisplayProps, TableV2 } from '../Table/TableV2';

const DEFAULT_PAGE_SIZE = 20;

interface ListPagePaginatedProps<T> {
  appRoute: string;
  breadcrumbs?: LinkProps[];
  pageContentTop?: ReactNode;
  pageContentBottom?: ReactNode;
  displayProps: DisplayProps<T>;
  errorText?: string;
  isError: boolean;
  isLoading: boolean;
  items: T[];
  noItemsText?: string;
  pageSize?: number;
  tableClassName?: string;
  title: string;
  themaId: string;
  totalCount?: number;
}

export function ListPagePaginated<T extends object = ZaakAanvraagDetail>({
  appRoute,
  breadcrumbs,
  pageContentTop,
  pageContentBottom,
  displayProps,
  errorText = 'We kunnen op dit moment niet alle gegevens tonen.',
  noItemsText = 'U heeft (nog) geen gegevens op deze pagina.',
  isError,
  isLoading,
  items,
  pageSize = DEFAULT_PAGE_SIZE,
  totalCount,
  tableClassName,
  title,
  themaId,
}: ListPagePaginatedProps<T>) {
  usePageTypeSetting('listpage');

  const { page = '1' } = useParams<{
    page?: string;
  }>();

  const currentPage = (() => {
    if (!page) {
      return 1;
    }
    return parseInt(page, 10);
  })();

  const itemsPaginated = useMemo(() => {
    const startIndex = currentPage - 1;
    const start = startIndex * pageSize;
    const end = start + pageSize;
    return items.slice(start, end);
  }, [currentPage, items, pageSize]);

  const total = totalCount ?? items.length;

  return (
    <PageV2
      breadcrumbs={breadcrumbs}
      heading={title}
      id={themaId}
      redactedThemaId={themaId}
    >
      {isError && (
        <PageContentCell>
          <ErrorAlert>{errorText}</ErrorAlert>
        </PageContentCell>
      )}
      {pageContentTop}
      <PageContentCell>
        {isLoading && (
          <LoadingContent
            barConfig={[
              ['100%', '2rem', '2rem'],
              ['100%', '2rem', '2rem'],
              ['100%', '2rem', '2rem'],
            ]}
          />
        )}
        {!isError && (
          <>
            {!isLoading && !itemsPaginated.length && !!noItemsText && (
              <Paragraph>{noItemsText}</Paragraph>
            )}
            {items.length > pageSize && (
              <PaginationV2
                totalCount={total}
                pageSize={pageSize}
                currentPage={currentPage}
                path={appRoute}
              />
            )}
            {!isLoading && !!itemsPaginated.length && (
              <TableV2<T>
                items={itemsPaginated}
                displayProps={displayProps}
                className={tableClassName}
              />
            )}
            {items.length > pageSize && (
              <PaginationV2
                totalCount={total}
                pageSize={pageSize}
                currentPage={currentPage}
                path={appRoute}
              />
            )}
          </>
        )}
      </PageContentCell>
      {pageContentBottom}
    </PageV2>
  );
}
