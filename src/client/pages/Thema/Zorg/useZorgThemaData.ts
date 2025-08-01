import {
  linkListItems,
  listPageParamKind,
  listPageTitle,
  routeConfig,
  tableConfig,
  themaId,
  themaTitle,
} from './Zorg-thema-config';
import { WMOVoorzieningFrontend } from '../../../../server/services/wmo/wmo-config-and-types';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useZorgThemaData() {
  const { WMO } = useAppStateGetter();

  const voorzieningen = addLinkElementToProperty<WMOVoorzieningFrontend>(
    WMO.content ?? [],
    'title',
    true
  );
  const breadcrumbs = useThemaBreadcrumbs(themaId);

  return {
    id: themaId,
    title: themaTitle,
    voorzieningen,
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
