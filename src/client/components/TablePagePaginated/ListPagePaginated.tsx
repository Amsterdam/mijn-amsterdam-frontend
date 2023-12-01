import { Alert, Grid, Paragraph, Screen } from '@amsterdam/design-system-react';
import { useMemo } from 'react';
import { generatePath, useHistory, useParams } from 'react-router-dom';
import { ChapterIcon, OverviewPage, PageHeading } from '..';
import { Chapter } from '../../../universal/config';
import { PaginationV2 } from '../Pagination/PaginationV2';
import { TableProps } from '../Table/Table';
import { TableV2 } from '../Table/TableV2';

const DEFAULT_PAGE_SIZE = 10;

interface ListPagePaginatedProps {
  items: object[];
  pageSize?: number;
  chapter?: Chapter;
  appRoute: string;
  appRouteBack: string;
  title: string;
  displayProps: TableProps<object>['displayProps'];
  titleKey?: string;
  isLoading: boolean;
  isError: boolean;
  errorText?: string;
}

export function ListPagePaginated({
  items,
  chapter,
  title,
  appRoute,
  appRouteBack,
  pageSize = DEFAULT_PAGE_SIZE,
  displayProps,
  titleKey,
  isLoading,
  isError,
  errorText = 'We kunnen op dit moment niet alle gegevens tonen.',
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
          {isError && (
            <Grid.Cell fullWidth>
              <Alert title="Foutmelding" icon severity="error">
                <Paragraph>{errorText}</Paragraph>
              </Alert>
            </Grid.Cell>
          )}
          <Grid.Cell fullWidth>
            <TableV2
              titleKey={titleKey}
              items={itemsPaginated}
              displayProps={displayProps}
            />
            {items.length > pageSize && (
              <PaginationV2
                totalCount={total}
                pageSize={pageSize}
                currentPage={currentPage}
                onPageClick={(page: number) => {
                  history.push(
                    generatePath(appRoute, {
                      page,
                    })
                  );
                }}
              />
            )}
          </Grid.Cell>
        </Grid>
      </Screen>
    </OverviewPage>
  );
}
