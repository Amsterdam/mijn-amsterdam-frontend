import { generatePath, useParams } from 'react-router';

import { ListPageParamKind } from './Bodem-thema-config';
import { useBodemData } from './useBodemData.hook';

export function useBodemListPageData() {
  const {
    themaId,
    items,
    isLoading,
    isError,
    tableConfig,
    breadcrumbs,
    listPageConfig,
  } = useBodemData();

  const params = useParams<{ kind: ListPageParamKind }>();
  const { kind = 'lopende-aanvragen' } = params;

  const { filter, sort, title, displayProps } = tableConfig[kind];

  return {
    themaId,
    items,
    filter,
    sort,
    title,
    displayProps,
    isLoading,
    isError,
    params,
    listPageRoute: generatePath(listPageConfig.route.path, {
      kind,
      page: null,
    }),
    breadcrumbs,
    routeConfig: listPageConfig.route,
  };
}
