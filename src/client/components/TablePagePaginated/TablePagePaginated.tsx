import { useMemo } from 'react';
import { generatePath, useHistory, useParams } from 'react-router-dom';
import { Chapter } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import { AppState } from '../../AppState';
import {
  Alert,
  ChapterIcon,
  Linkd,
  OverviewPage,
  PageContent,
  PageHeading,
  Pagination,
  Section,
  Table,
} from '../../components';
import {
  addTitleLinkComponent,
  TableProps,
} from '../../components/Table/Table';
import { useAppStateGetter } from '../../hooks';
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
  console.log('showLink', showLink, count, cutOffAt);
  return showLink ? (
    <p className={styles.ShowAllButtonContainer}>
      <Linkd href={generatePath(appRouteWithPageParam, params)}>{label}</Linkd>
    </p>
  ) : null;
}

interface PageTablePaginatedProps {
  stateKey: keyof AppState;
  pageSize?: number;
  chapter?: Chapter;
  appRoute: string;
  appRouteBack: string;
  listTitle: string;
  title: string;
  displayProps: TableProps['displayProps'];
  mapFn?: (item: any) => any;
  titleKey: string;
}

export function PageTablePaginated({
  stateKey,
  chapter,
  listTitle,
  title,
  appRoute,
  appRouteBack,
  pageSize = DEFAULT_PAGE_SIZE,
  displayProps,
  mapFn,
  titleKey,
}: PageTablePaginatedProps) {
  const ITEMS = useAppStateGetter()[stateKey];
  const items: any = useMemo(() => {
    if (!Array.isArray(ITEMS.content) || !ITEMS.content.length) {
      return [];
    }

    let items = ITEMS.content;

    if (mapFn) {
      items = ITEMS.content.map(mapFn);
    }

    return addTitleLinkComponent(items, titleKey);
  }, [ITEMS.content, mapFn, titleKey]);

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
        icon={<ChapterIcon chapter={chapter} />}
        backLink={{ to: appRouteBack, title: 'Overzicht' }}
        isLoading={isLoading(ITEMS)}
      >
        {title}
      </PageHeading>
      <PageContent>
        {isError(ITEMS) && (
          <Alert type="warning">
            <p>We kunnen op dit moment niet alle gegevens tonen.</p>
          </Alert>
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
