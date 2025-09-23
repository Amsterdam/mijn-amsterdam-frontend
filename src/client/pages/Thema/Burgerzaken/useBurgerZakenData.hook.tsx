import {
  tableConfig,
  linkListItems,
  routeConfig,
  themaId,
  themaTitle,
} from './Burgerzaken-thema-config';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useBurgerZakenData() {
  const { BRP } = useAppStateGetter();

  const documents = addLinkElementToProperty(
    BRP.content?.identiteitsbewijzen ?? [],
    'documentType',
    true
  );

  const breadcrumbs = useThemaBreadcrumbs(themaId);

  return {
    id: themaId,
    title: themaTitle,
    tableConfig,
    linkListItems,
    isLoading: isLoading(BRP),
    isError: isError(BRP),
    documents,
    breadcrumbs,
    listPageRoute: routeConfig.listPage.path,
    routeConfig,
  };
}
