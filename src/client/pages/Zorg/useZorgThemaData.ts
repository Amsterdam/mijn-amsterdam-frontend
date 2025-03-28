import {
  linkListItems,
  listPageParamKind,
  listPageTitle,
  routes,
  tableConfig,
} from './Zorg-thema-config';
import { WMOVoorzieningFrontend } from '../../../server/services/wmo/wmo-config-and-types';
import { Themas } from '../../../universal/config/thema';
import { isError, isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaMenuItemByThemaID } from '../../hooks/useThemaMenuItems';

export function useZorgThemaData() {
  const { WMO } = useAppStateGetter();

  const regelingen = addLinkElementToProperty<WMOVoorzieningFrontend>(
    WMO.content ?? [],
    'title',
    true
  );
  const themaPaginaBreadcrumb = useThemaMenuItemByThemaID(Themas.ZORG);
  const title = ThemaTitles.ZORG;

  return {
    regelingen,
    title,
    isLoading: isLoading(WMO),
    isError: isError(WMO),
    routes,
    tableConfig,
    listPageTitle,
    listPageParamKind,
    linkListItems,
    themaPaginaBreadcrumb,
  };
}
