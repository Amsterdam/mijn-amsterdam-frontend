import { generatePath, useParams } from 'react-router';

import { TableHeaders, themaConfig } from './Bodem-thema-config';
import { useBodemData } from './useBodemData.hook';

export function useBodemListPageData() {
  const {
    themaId,
    items,
    isLoading,
    isError,
    tableConfig,
    breadcrumbs,
    listPageRoute,
  } = useBodemData();
  const params = useParams<{ kind: TableHeaders }>();
  const { kind = 'lopende-aanvragen' } = params;
  const { filter, sort, title, displayProps } = tableConfig[kind];

  return {
    themaId: themaId,
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
    routeConfig: themaConfig.listPage.route,
  };
}
