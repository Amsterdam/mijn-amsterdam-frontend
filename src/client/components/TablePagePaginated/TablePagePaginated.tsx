import { useMemo } from 'react';
import { generatePath, useHistory, useParams } from 'react-router-dom';

import { Thema } from '../../../universal/config/thema';
import {
  ErrorAlert,
  Linkd,
  OverviewPage,
  PageContent,
  PageHeading,
  Pagination,
  Section,
  Table,
  ThemaIcon,
} from '../../components';
import { TableProps } from '../../components/Table/Table';
import styles from './TablePagePaginated.module.scss';

const DEFAULT_PAGE_SIZE = 10;

interface PageTableCutoffLinkProps {
  count: number;
  appRouteWithPageParam: string;
  cutOffAt?: number;
  params?: Record<string, any>;
  label?: string;
}

export function PageTableCutoffLink({
  label = 'Toon alles',
  count = 0,
  cutOffAt = 3,
  appRouteWithPageParam,
  params,
}: PageTableCutoffLinkProps) {
  const showLink = count > cutOffAt;

  return showLink ? (
    <p className={styles.ShowAllButtonContainer}>
      <Linkd href={generatePath(appRouteWithPageParam, params)}>{label}</Linkd>
    </p>
  ) : null;
}

interface PageTablePaginatedProps {
  items: object[];
  pageSize?: number;
  thema?: Thema;
  appRoute: string;
  appRouteBack: string;
  listTitle: string;
  title: string;
  displayProps: TableProps<object>['displayProps'];
  mapFn?: (item: any) => any;
  filterFn?: (item: any) => any;
  titleKey?: string;
  isLoading: boolean;
  isError: boolean;
}

export function PageTablePaginated({
  items,
  thema,
  listTitle,
  title,
  appRoute,
  appRouteBack,
  pageSize = DEFAULT_PAGE_SIZE,
  displayProps,
  titleKey,
  isLoading,
  isError,
}: PageTablePaginatedProps) {
  const history = useHistory();

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

  const total = items.length;

  return (
    <OverviewPage>
      <PageHeading
        icon={<ThemaIcon thema={thema} />}
        backLink={{ to: appRouteBack, title: 'Overzicht' }}
        isLoading={isLoading}
      >
        {title}
      </PageHeading>
      <PageContent>
        {isError && (
          <ErrorAlert>
            We kunnen op dit moment niet alle gegevens tonen.
          </ErrorAlert>
        )}
      </PageContent>
      <Section title={listTitle} className={styles.TableSection}>
        {currentPage !== 1 && <p>Pagina {currentPage}</p>}
        {!!items.length && (
          <Table
            className={styles.SpecificationsTable}
            items={itemsPaginated}
            displayProps={displayProps}
            titleKey={titleKey}
          />
        )}

        {items.length > pageSize && (
          <Pagination
            className={styles.Pagination}
            totalCount={total}
            pageSize={pageSize}
            currentPage={currentPage}
            onPageClick={(page) => {
              history.push(
                generatePath(appRoute, {
                  page,
                })
              );
            }}
          />
        )}
      </Section>
    </OverviewPage>
  );
}
