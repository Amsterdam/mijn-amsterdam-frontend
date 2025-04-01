import { useParams } from 'react-router';

import { ListPageParamKind } from './Parkeren-thema-config';
import { useParkerenData } from './useParkerenData.hook';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function ParkerenList() {
  const params = useParams<{ kind: ListPageParamKind }>();

  const { vergunningen, isLoading, isError, tableConfig, routes, breadcrumbs } =
    useParkerenData();

  const { displayProps, title, filter, sort } = tableConfig[params.kind];

  return (
    <ListPagePaginated
      items={vergunningen.filter(filter).sort(sort)}
      title={title}
      appRoute={routes.listPage}
      appRouteParams={params}
      breadcrumbs={breadcrumbs}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
