import { Alert, Grid, Paragraph, Screen } from '@amsterdam/design-system-react';
import { ReactNode, useMemo } from 'react';
import { generatePath, useHistory, useParams } from 'react-router-dom';
import { ChapterIcon, LoadingContent, OverviewPage, PageHeading } from '..';
import { Chapter } from '../../../universal/config';
import { PaginationV2 } from '../Pagination/PaginationV2';
import { MaParagraph } from '../Paragraph/Paragraph';
import { TableV2 } from '../Table/TableV2';

const DEFAULT_PAGE_SIZE = 10;

interface ListPagePaginatedProps {
  appRoute: string;
  appRouteBack: string;
  appRouteParams?: Record<string, string> | null;
  body?: ReactNode;
  chapter?: Chapter;
  displayProps: Record<string, string> | null;
  errorText?: string;
  noItemsText?: string;
  isError: boolean;
  isLoading: boolean;
  items: object[];
  pageSize?: number;
  tableGridColStyles?: string[];
  title: string;
}

export function ListPagePaginated({
  appRoute,
  appRouteBack,
  appRouteParams = null,
  body,
  chapter,
  displayProps,
  errorText = 'We kunnen op dit moment niet alle gegevens tonen.',
  noItemsText = 'U heet geen gegevens op deze pagina.',
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
          {!!body && <Grid.Cell fullWidth>{body}</Grid.Cell>}
          {isError && (
            <Grid.Cell fullWidth>
              <Alert title="Foutmelding" icon severity="error">
                <Paragraph>{errorText}</Paragraph>
              </Alert>
            </Grid.Cell>
          )}
          <Grid.Cell fullWidth>
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
                  <Grid.Cell fullWidth>
                    <MaParagraph>{noItemsText}</MaParagraph>
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
