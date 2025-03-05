import { useParams } from 'react-router-dom';

import { ListPageParamKind } from './HLI-thema-config';
import { HistoricItemsMention } from './HLIThemaPagina';
import { useHliThemaData } from './useHliThemaData';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import { PageContentCell } from '../../components/Page/Page';

export function HLIRegelingen() {
  const { kind } = useParams<{ kind: ListPageParamKind }>();
  const { regelingen, tableConfig, title, routes, isLoading, isError } =
    useHliThemaData();
  const listPageTableConfig = tableConfig[kind];

  return (
    <>
      <ListPagePaginated
        items={regelingen
          .filter(listPageTableConfig.filter)
          .sort(listPageTableConfig.sort)}
        title={listPageTableConfig.title}
        appRoute={routes.listPage}
        appRouteParams={{ kind }}
        appRouteBack={routes.themaPage}
        displayProps={listPageTableConfig.displayProps}
        isLoading={isLoading}
        isError={isError}
        tableClassName={listPageTableConfig.className}
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
