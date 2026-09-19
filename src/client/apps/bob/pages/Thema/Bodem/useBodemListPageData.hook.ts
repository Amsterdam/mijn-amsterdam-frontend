import { generatePath, useParams } from 'react-router';

import type { ListPageParamKind } from './Bodem-thema-config.ts';
import { useBodemData } from './useBodemData.hook.tsx';

export function useBodemListPageData() {
  const {
    themaId,
    items,
    isLoading,
    isError,
    tableConfig,
    breadcrumbs,
    themaConfig,
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
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind,
      page: null,
    }),
    breadcrumbs,
    listPageConfig: themaConfig.listPage,
  };
}
