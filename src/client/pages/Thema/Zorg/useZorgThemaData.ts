import {
  linkListItems,
  listPageParamKind,
  listPageTitle,
  routes,
  tableConfig,
} from './Zorg-thema-config';
import { WMOVoorzieningFrontend } from '../../../../server/services/wmo/wmo-config-and-types';
import { ThemaIDs } from '../../../../universal/config/thema';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { ThemaTitles } from '../../../config/thema';
import { useAppStateGetter } from '../../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useZorgThemaData() {
  const { WMO } = useAppStateGetter();

  const voorzieningen = addLinkElementToProperty<WMOVoorzieningFrontend>(
    WMO.content ?? [],
    'title',
    true
  );
  const breadcrumbs = useThemaBreadcrumbs(ThemaIDs.ZORG);
  const title = ThemaTitles.ZORG;

  return {
    voorzieningen,
    title,
    isLoading: isLoading(WMO),
    isError: isError(WMO),
    routes,
    tableConfig,
    listPageTitle,
    listPageParamKind,
    linkListItems,
    breadcrumbs,
  };
}
