import { routeConfig, tableConfig, themaConfig } from './Jeugd-thema-config';
import { listPageParamKind, listPageTitle } from './Jeugd-thema-config';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useJeugdThemaData() {
  const { JEUGD } = useAppStateGetter();

  const voorzieningen = addLinkElementToProperty(
    JEUGD.content ?? [],
    'title',
    true
  );

  return {
    voorzieningen,
    themaId: themaConfig.id,
    title: themaConfig.title,
    breadcrumbs: useThemaBreadcrumbs(themaConfig.id),
    isLoading: isLoading(JEUGD),
    isError: isError(JEUGD),
    tableConfig,
    listPageTitle,
    listPageParamKind,
    pageLinks: themaConfig.pageLinks,
    routeConfig,
    themaConfig,
  };
}
