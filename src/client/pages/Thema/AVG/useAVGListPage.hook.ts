import { useParams } from 'react-router';

import { ListPageParamKind, routeConfig } from './AVG-thema-config';
import { useAVGData } from './useAVGData.hook';

export function useAVGListPageData() {
  const { avgVerzoeken, isLoading, isError, tableConfig, breadcrumbs } =
    useAVGData();
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
    params,
    listPageRoute: routeConfig.listPage.path,
    routeConfig,
  };
}
