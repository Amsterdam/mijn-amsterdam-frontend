import { Alert, Grid, Paragraph, Screen } from '@amsterdam/design-system-react';
import { ReactNode, useMemo } from 'react';
import { generatePath, useHistory, useParams } from 'react-router-dom';
import { ChapterIcon, LoadingContent, OverviewPage, PageHeading } from '..';
import { Chapter } from '../../../universal/config';
import { PaginationV2 } from '../Pagination/PaginationV2';
import { TableV2 } from '../Table/TableV2';

const DEFAULT_PAGE_SIZE = 10;

interface ListPagePaginatedProps {
  appRoute: string;
  appRouteBack: string;
  appRouteParams?: Record<string, string> | null;
  displayProps: Record<string, string> | null;
  isError: boolean;
  isLoading: boolean;
  items: object[];
  title: string;
  body?: ReactNode;
  chapter?: Chapter;
  errorText?: string;
  noItemsText?: string;
  pageSize?: number;
  tableGridColStyles?: string[];
}

export function ListPagePaginated({
  appRoute,
  appRouteBack,
  appRouteParams = null,
  body,
  chapter,
  displayProps,
  errorText = 'We kunnen op dit moment niet alle gegevens tonen.',
  noItemsText = 'U heeft (nog) geen gegevens op deze pagina.',
  isError,
  isLoading,
  items,
  pageSize = DEFAULT_PAGE_SIZE,
  tableGridColStyles,
  title,
}: ListPagePaginatedProps) {
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
        isLoading={isLoading}
      >
        {title}
      </PageHeading>
      <Screen>
        <Grid>
          {!!body && <Grid.Cell span="all">{body}</Grid.Cell>}
          {isError && (
            <Grid.Cell span="all">
              <Alert title="Foutmelding" severity="error">
                <Paragraph>{errorText}</Paragraph>
              </Alert>
            </Grid.Cell>
          )}
          <Grid.Cell span="all">
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
                {!itemsPaginated.length && !!noItemsText && (
                  <Grid.Cell span="all">
                    <Paragraph>{noItemsText}</Paragraph>
                  </Grid.Cell>
                )}
                {!isLoading && !!itemsPaginated.length && (
                  <TableV2
                    items={itemsPaginated}
                    displayProps={displayProps}
                    gridColStyles={tableGridColStyles}
                  />
                )}
                {items.length > pageSize && (
                  <PaginationV2
                    totalCount={total}
                    pageSize={pageSize}
                    currentPage={currentPage}
                    onPageClick={(page: number) => {
                      history.push(
                        generatePath(appRoute, {
                          ...appRouteParams,
                          page,
                        })
                      );
                    }}
                  />
                )}
              </>
            )}
          </Grid.Cell>
        </Grid>
      </Screen>
    </OverviewPage>
  );
}
