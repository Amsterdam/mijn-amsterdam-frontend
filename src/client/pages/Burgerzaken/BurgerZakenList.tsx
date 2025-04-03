import { useParams } from 'react-router-dom';

import { useBurgerZakenData } from './useBurgerZakenData.hook';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';
import { ListPageParamKind } from '../Vergunningen/Vergunningen-thema-config';

export function BurgerZakenList() {
  const { documents, isLoading, isError, tableConfig, routes, breadcrumbs } =
    useBurgerZakenData();
  const params = useParams<{ kind: ListPageParamKind }>();

  const { sort, title, displayProps } = tableConfig[params.kind];

  return (
    <ListPagePaginated
      items={documents.sort(sort)}
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
