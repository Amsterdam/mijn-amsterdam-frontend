import { useParams } from 'react-router-dom';

import { ListPageParamKind } from './Parkeren-thema-config';
import { useParkerenData } from './useParkerenData.hook';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function ParkerenList() {
  const params = useParams<{ kind: ListPageParamKind }>();

  const {
    vergunningen,
    isLoading,
    isError,
    tableConfig,
    routes,
    themaPaginaBreadcrumb,
  } = useParkerenData();

  const { displayProps, title, filter, sort } = tableConfig[params.kind];

  return (
    <ListPagePaginated
      items={vergunningen.filter(filter).sort(sort)}
      title={title}
      appRoute={routes.listPage}
      appRouteParams={params}
      breadcrumbs={[themaPaginaBreadcrumb]}
      displayProps={displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
