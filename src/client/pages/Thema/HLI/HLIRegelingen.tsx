import { useParams } from 'react-router';

import { ListPageParamKind } from './HLI-thema-config';
import { HistoricItemsMention } from './HLIThemaPagina';
import { useHliThemaData } from './useHliThemaData';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';
import { PageContentCell } from '../../../components/Page/Page';

export function HLIRegelingen() {
  const { kind } = useParams<{ kind: ListPageParamKind }>();
  const { regelingen, tableConfig, routes, isLoading, isError, breadcrumbs } =
    useHliThemaData();

  const { filter, sort, title, displayProps, className } = tableConfig[kind];

  return (
    <>
      <ListPagePaginated
        items={regelingen.filter(filter).sort(sort)}
        title={title}
        appRoute={routes.listPage}
        appRouteParams={{ kind }}
        breadcrumbs={breadcrumbs}
        displayProps={displayProps}
        isLoading={isLoading}
        isError={isError}
        tableClassName={className}
        pageContentBottom={
          <PageContentCell startWide={3} spanWide={8}>
            {kind === 'eerdere-en-afgewezen-regelingen' && (
              <HistoricItemsMention />
            )}
          </PageContentCell>
        }
      />
    </>
  );
}
