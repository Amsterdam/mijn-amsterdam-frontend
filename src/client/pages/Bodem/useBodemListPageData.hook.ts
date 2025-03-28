import { useParams } from 'react-router-dom';

import { ListPageParamKind, routes } from './Bodem-thema-config';
import { useBodemData } from './useBodemData.hook';
import { AppRoutes } from '../../../universal/config/routes';
import { Themas } from '../../../universal/config/thema';
import { useThemaMenuItemByThemaID } from '../../hooks/useThemaMenuItems';

export function useBodemListPageData() {
  const { items, isLoading, isError, tableConfig } = useBodemData();
  const appRouteBack = AppRoutes.BODEM;
  const params = useParams<{ kind: ListPageParamKind }>();
  const { filter, sort, title, displayProps } = tableConfig[params.kind];
  const themaLink = useThemaMenuItemByThemaID(Themas.BODEM);

  return {
    items,
    filter,
    sort,
    title,
    displayProps,
    isLoading,
    isError,
    params,
    appRoute: routes.listPage,
    appRouteBack,
    themaPaginaBreadcrumb: themaLink,
    routes,
  };
}
