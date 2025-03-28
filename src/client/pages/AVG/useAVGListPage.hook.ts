import { useParams } from 'react-router-dom';

import { ListPageParamKind, routes } from './AVG-thema-config';
import { useAVGData } from './useAVGData.hook';

export function useAVGListPageData() {
  const { avgVerzoeken, isLoading, isError, tableConfig, breadcrumbs } =
    useAVGData();
  const params = useParams<{ kind: ListPageParamKind }>();

  const { filter, sort, title, displayProps } =
    tableConfig[params.kind] ?? null;

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
    listPageRoute: routes.listPage,
  };
}
