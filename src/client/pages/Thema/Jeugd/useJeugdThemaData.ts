import { tableConfig, themaConfig } from './Jeugd-thema-config.ts';
import { listPageParamKind, listPageTitle } from './Jeugd-thema-config.ts';
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

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
    themaConfig,
  };
}
