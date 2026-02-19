import {
  listPageParamKind,
  listPageTitle,
  tableConfig,
  themaConfig,
} from './Zorg-thema-config';
import { WMOVoorzieningFrontend } from '../../../../server/services/wmo/wmo-types';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

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
