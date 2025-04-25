import { useParams } from 'react-router';

import type { ListPageParamKind } from './Jeugd-thema-config';
import { useJeugdThemaData } from './useJeugdThemaData';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated';

export function JeugdList() {
  const { kind = 'huidige-voorzieningen' } = useParams<{
    kind: ListPageParamKind;
  }>();
  const { voorzieningen, tableConfig, isLoading, isError, breadcrumbs } =
    useJeugdThemaData();
  const listPageTableConfig = tableConfig[kind];

  return (
    <ListPagePaginated
      items={voorzieningen.filter(listPageTableConfig.filter)}
      title={listPageTableConfig.title}
      appRoute={listPageTableConfig.listPageRoute}
      appRouteParams={{ kind }}
      breadcrumbs={breadcrumbs}
      displayProps={listPageTableConfig.displayProps}
      isLoading={isLoading}
      isError={isError}
      tableClassName={listPageTableConfig.className}
    />
  );
}
