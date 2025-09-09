import { routeConfig, tableConfig, themaConfig } from './Bodem-thema-config';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useBodemData() {
  const { BODEM } = useAppStateGetter();
  const items = addLinkElementToProperty(BODEM.content ?? [], 'adres', true);
  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);

  return {
    id: themaConfig.id,
    title: themaConfig.title,
    tableConfig,
    isLoading: isLoading(BODEM),
    isError: isError(BODEM),
    items,
    linkListItems: themaConfig.linkListItems,
    breadcrumbs,
    listPageRoute: routeConfig.listPage.path,
    routeConfig,
  };
}
