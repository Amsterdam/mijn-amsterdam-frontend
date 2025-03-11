import { useParams } from 'react-router-dom';

import { ListPageParamKind, routes } from './AVG-thema-config';
import { useAVGData } from './useAVGData.hook';
import { Themas } from '../../../universal/config/thema';
import { useThemaMenuItemByThemaID } from '../../hooks/useThemaMenuItems';

export function useAVGListPageData() {
  const { avgVerzoeken, isLoading, isError, tableConfig } = useAVGData();
  const themaPaginaBreadcrumb = useThemaMenuItemByThemaID(Themas.AVG);
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
    themaPaginaBreadcrumb,
    params,
    listPageRoute: routes.listPage,
  };
}
