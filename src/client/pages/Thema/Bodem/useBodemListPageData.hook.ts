import { useParams } from 'react-router';

import { ListPageParamKind, routes } from './Bodem-thema-config';
import { useBodemData } from './useBodemData.hook';
import { AppRoutes } from '../../../../universal/config/routes';

export function useBodemListPageData() {
  const { items, isLoading, isError, tableConfig, breadcrumbs } =
    useBodemData();
  const appRouteBack = AppRoutes.BODEM;
  const params = useParams<{ kind: ListPageParamKind }>();
  const { filter, sort, title, displayProps } = tableConfig[params.kind];

  return {
    items,
    filter,
    sort,
    title,
    displayProps,
    isLoading,
    isError,
    params,
    appRoute: routes.listPage,
    appRouteBack,
    breadcrumbs,
    routes,
  };
}
