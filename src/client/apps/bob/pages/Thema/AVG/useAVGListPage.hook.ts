import { generatePath, useParams } from 'react-router';

import type { ListPageParamKind } from './AVG-thema-config.ts';
import { useAVGData } from './useAVGData.hook.tsx';

export function useAVGListPageData() {
  const {
    avgVerzoeken,
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
