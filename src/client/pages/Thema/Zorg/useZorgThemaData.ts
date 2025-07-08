import {
  linkListItems,
  listPageParamKind,
  listPageTitle,
  routeConfig,
  tableConfig,
  themaId,
  themaTitle,
} from './Zorg-thema-config.ts';
import { WMOVoorzieningFrontend } from '../../../../server/services/wmo/wmo-config-and-types.ts';
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../hooks/useAppState.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

export function useZorgThemaData() {
  const { WMO } = useAppStateGetter();

  const voorzieningen = addLinkElementToProperty<WMOVoorzieningFrontend>(
    WMO.content ?? [],
    'title',
    true
  );
  const breadcrumbs = useThemaBreadcrumbs(themaId);
  const title = themaTitle;

  return {
    voorzieningen,
    title,
    isLoading: isLoading(WMO),
    isError: isError(WMO),
    tableConfig,
    listPageTitle,
    listPageParamKind,
    linkListItems,
    breadcrumbs,
    routeConfig,
  };
}
