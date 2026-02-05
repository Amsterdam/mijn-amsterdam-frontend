import { generatePath, useParams } from 'react-router';

import { ListPageParamKind } from './AVG-thema-config';
import { useAVGData } from './useAVGData.hook';

export function useAVGListPageData() {
  const {
    avgVerzoeken,
    id: themaId,
    isLoading,
    isError,
    tableConfig,
    breadcrumbs,
    themaConfig,
  } = useAVGData();
  const params = useParams<{
    kind: ListPageParamKind;
  }>();
  const { kind = 'lopende-aanvragen' } = params;

  const { filter, sort, title, displayProps } = tableConfig[kind] ?? null;

  return {
    avgVerzoeken,
    filter,
    sort,
    themaId,
    title,
    displayProps,
    isLoading,
    isError,
    breadcrumbs,
    themaConfig,
    params,
    listPageRoute: generatePath(themaConfig.listPage.route.path, {
      kind,
      page: null,
    }),
  };
}
