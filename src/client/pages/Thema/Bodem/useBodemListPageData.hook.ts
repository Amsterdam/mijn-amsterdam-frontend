import { generatePath, useParams } from 'react-router';

import { ListPageParamKind } from './Bodem-thema-config';
import { useBodemData } from './useBodemData.hook';

export function useBodemListPageData() {
  const {
    items,
    isLoading,
    isError,
    tableConfig,
    breadcrumbs,
    themaConfig,
    routeConfig,
  } = useBodemData();

  const params = useParams<{ kind: ListPageParamKind }>();
  const { kind = 'lopende-aanvragen' } = params;
  const { filter, sort, title, displayProps } = tableConfig[kind];

  return {
    // scoped configuratie — alleen de listPage info
    config: themaConfig.listPage,
    items,
    filter,
    sort,
    themaId: themaConfig.id,
    title,
    displayProps,
    isLoading,
    isError,
    params,
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind,
      page: null,
    }),
    breadcrumbs,
    routeConfig,
  };
}
