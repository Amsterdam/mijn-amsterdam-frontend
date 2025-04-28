import { ReactNode, useMemo } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';
import { generatePath, Params, useNavigate, useParams } from 'react-router';

import { LinkProps, ZaakDetail } from '../../../universal/types/App.types';
import { usePageTypeSetting } from '../../hooks/useThemaMenuItems';
import ErrorAlert from '../Alert/Alert';
import LoadingContent from '../LoadingContent/LoadingContent';
import { OverviewPageV2, PageContentCell, PageContentV2 } from '../Page/Page';
import { PageHeadingV2 } from '../PageHeading/PageHeadingV2';
import { PaginationV2 } from '../Pagination/PaginationV2';
import { DisplayProps, TableV2 } from '../Table/TableV2';

const DEFAULT_PAGE_SIZE = 20;

interface ListPagePaginatedProps<T> {
  appRoute: string;
  breadcrumbs?: LinkProps[];
  appRouteParams?: Record<string, string> | Readonly<Params<string>> | null;
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
  totalCount?: number;
}

export function ListPagePaginated<T extends object = ZaakDetail>({
  appRoute,
  breadcrumbs,
  appRouteParams = null,
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
}: ListPagePaginatedProps<T>) {
  usePageTypeSetting('listpage');

  const navigate = useNavigate();

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

  // It's easy to pass a pre-generated path with the page param omitted so let's be kind and add it if it's missing.
  const appRouteWithPageParam = !appRoute.includes(':page')
    ? `${appRoute}/:page`
    : appRoute;

  return (
    <OverviewPageV2>
      <PageContentV2>
        <PageHeadingV2 breadcrumbs={breadcrumbs}>{title}</PageHeadingV2>
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
                  onPageClick={(page: number) => {
                    const path = generatePath(appRouteWithPageParam, {
                      ...appRouteParams,
                      page,
                    });
                    navigate(path);
                  }}
                />
              )}
            </>
          )}
        </PageContentCell>
        {pageContentBottom}
      </PageContentV2>
    </OverviewPageV2>
  );
}
