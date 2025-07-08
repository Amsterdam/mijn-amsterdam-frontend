import { generatePath, useParams } from 'react-router';

import { ListPageParamKind, routeConfig } from './Bodem-thema-config.ts';
import { useBodemData } from './useBodemData.hook.tsx';

export function useBodemListPageData() {
  const { items, isLoading, isError, tableConfig, breadcrumbs, listPageRoute } =
    useBodemData();
  const params = useParams<{ kind: ListPageParamKind }>();
  const { kind = 'lopende-aanvragen' } = params;
  const { filter, sort, title, displayProps } = tableConfig[kind];

  return {
    items,
    filter,
    sort,
    title,
    displayProps,
    isLoading,
    isError,
    params,
    listPageRoute: generatePath(listPageRoute, { kind, page: null }),
    breadcrumbs,
    routeConfig,
  };
}
