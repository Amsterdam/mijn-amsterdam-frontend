import { tableConfig, themaConfig } from './Bodem-thema-config';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useBodemData() {
  const { BODEM } = useAppStateGetter();
  const items = addLinkElementToProperty(BODEM.content ?? [], 'adres', true);
  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);

  return {
    themaId: themaConfig.id,
    title: themaConfig.title,
    tableConfig,
    isLoading: isLoading(BODEM),
    isError: isError(BODEM),
    items,
    linkListItems: themaConfig.pageLinks,
    breadcrumbs,
    listPageConfig: themaConfig.listPage,
    detailPageConfig: themaConfig.detailPage,
  };
}
