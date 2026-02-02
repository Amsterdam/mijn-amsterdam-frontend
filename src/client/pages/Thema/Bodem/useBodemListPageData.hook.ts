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
