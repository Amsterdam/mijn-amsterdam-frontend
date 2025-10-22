import { generatePath, useParams } from 'react-router';

import { ListPageParamKind, listPageKind } from './Bodem-thema-config';
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

  const params = useParams<{ kind?: string }>();

  const kind: ListPageParamKind =
    params.kind === listPageKind.inProgress ||
    params.kind === listPageKind.completed
      ? (params.kind as ListPageParamKind)
      : listPageKind.inProgress;

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
