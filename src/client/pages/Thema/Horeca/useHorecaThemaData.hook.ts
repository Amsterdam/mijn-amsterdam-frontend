import {
  tableConfig,
  LinkListItems,
  routeConfig,
  themaConfig,
} from './Horeca-thema-config';
import { HorecaVergunningFrontend } from '../../../../server/services/horeca/decos-zaken';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useHorecaThemaData() {
  const { HORECA } = useAppStateGetter();
  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);
  const vergunningen = addLinkElementToProperty<HorecaVergunningFrontend>(
    HORECA.content ?? [],
    'identifier',
    true
  );

  return {
    vergunningen,
    isLoading: isLoading(HORECA),
    isError: isError(HORECA),
    linkListItems: LinkListItems,
    tableConfig,
    themaId: themaConfig.id,
    themaTitle: themaConfig.title,
    breadcrumbs,
    listPageRoute: routeConfig.listPage.path,
    routeConfig,
  };
}
