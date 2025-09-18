import { generatePath, useParams } from 'react-router';

import { ListPageParamKind, themaConfig } from './Bodem-thema-config';
import { useBodemData } from './useBodemData.hook';

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
    themaId: themaConfig.id,
    title,
    displayProps,
    isLoading,
    isError,
    params,
    listPageRoute: generatePath(listPageRoute, { kind, page: null }),
    breadcrumbs,
  };
}
