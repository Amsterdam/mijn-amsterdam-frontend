import {
  tableConfig,
  LinkListItems,
  themaId,
  routeConfig,
  themaTitle,
} from './Horeca-thema-config';
import { HorecaVergunningFrontend } from '../../../../server/services/horeca/decos-zaken';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useHorecaThemaData() {
  const { HORECA } = useAppStateGetter();
  const breadcrumbs = useThemaBreadcrumbs(themaId);
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
    themaTitle: themaTitle,
    breadcrumbs,
    listPageRoute: routeConfig.listPage.path,
    routeConfig,
  };
}
