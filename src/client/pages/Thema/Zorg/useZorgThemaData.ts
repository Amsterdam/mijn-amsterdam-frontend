import {
  listPageParamKind,
  listPageTitle,
  tableConfig,
  themaConfig,
} from './Zorg-thema-config.ts';
import type { WMOVoorzieningFrontend } from '../../../../server/services/wmo/wmo-types.ts';
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

export function useZorgThemaData() {
  const { WMO } = useAppStateGetter();

  const voorzieningen = addLinkElementToProperty<WMOVoorzieningFrontend>(
    WMO.content ?? [],
    'title',
    true
  );
  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);

  return {
    themaId: themaConfig.id,
    title: themaConfig.title,
    voorzieningen,
    isLoading: isLoading(WMO),
    isError: isError(WMO),
    tableConfig,
    listPageTitle,
    listPageParamKind,
    pageLinks: themaConfig.pageLinks,
    breadcrumbs,
    themaConfig,
  };
}
