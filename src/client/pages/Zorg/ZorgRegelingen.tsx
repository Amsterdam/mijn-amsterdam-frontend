import { useParams } from 'react-router';

import { useZorgThemaData } from './useZorgThemaData';
import { HistoricItemsMention } from './Zorg';
import { ListPageParamKind } from './Zorg-thema-config';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import { PageContentCell } from '../../components/Page/Page';

export function ZorgRegelingen() {
  const { kind } = useParams<{ kind: ListPageParamKind }>();
  const {
    voorzieningen,
    tableConfig,
    routes,
    isLoading,
    isError,
    listPageParamKind,
    breadcrumbs,
  } = useZorgThemaData();
  const listPageTableConfig = tableConfig[kind];

  return (
    <ListPagePaginated
      items={voorzieningen.filter(listPageTableConfig.filter)}
      title={listPageTableConfig.title}
      appRoute={routes.listPage}
      appRouteParams={{ kind }}
      breadcrumbs={breadcrumbs}
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
