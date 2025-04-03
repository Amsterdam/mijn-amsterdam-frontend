import { useParams } from 'react-router-dom';

import { useZorgThemaData } from './useZorgThemaData';
import { HistoricItemsMention } from './Zorg';
import { ListPageParamKind } from './Zorg-thema-config';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import { PageContentCell } from '../../components/Page/Page';
import { NotFound } from '../NotFound/NotFound';

export function ZorgRegelingen() {
  const { kind } = useParams<{ kind: ListPageParamKind }>();
  const {
    regelingen,
    tableConfig,
    routes,
    isLoading,
    isError,
    listPageParamKind,
  } = useZorgThemaData();
  const listPageTableConfig = tableConfig[kind];

  if (!listPageTableConfig) {
    return <NotFound />;
  }

  return (
    <ListPagePaginated
      items={regelingen.filter(listPageTableConfig.filter)}
      title={listPageTableConfig.title}
      appRoute={routes.listPage}
      appRouteParams={{ kind }}
      appRouteBack={routes.themaPage}
      displayProps={listPageTableConfig.displayProps}
      isLoading={isLoading}
      isError={isError}
      tableClassName={listPageTableConfig.className}
      pageContentBottom={
        <PageContentCell spanWide={8} startWide={3}>
          {kind === listPageParamKind.historic && <HistoricItemsMention />}
        </PageContentCell>
      }
    />
  );
}
