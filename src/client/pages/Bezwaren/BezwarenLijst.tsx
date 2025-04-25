import { useParams } from 'react-router';

import { ListPageParamKind } from './Bezwaren-thema-config';
import { useBezwarenThemaData } from './useBezwarenThemaData.hook';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

export function BezwarenLijstPagina() {
  const { kind } = useParams<{ kind: ListPageParamKind }>();
  const { bezwaren, tableConfig, routes, isLoading, isError, breadcrumbs } =
    useBezwarenThemaData();
  const listPageTableConfig = tableConfig[kind];

  return (
    <ListPagePaginated
      items={bezwaren.filter(listPageTableConfig.filter)}
      title={listPageTableConfig.title}
      appRoute={routes.listPage}
      appRouteParams={{ kind }}
      breadcrumbs={breadcrumbs}
      displayProps={listPageTableConfig.displayProps}
      isLoading={isLoading}
      isError={isError}
    />
  );
}
