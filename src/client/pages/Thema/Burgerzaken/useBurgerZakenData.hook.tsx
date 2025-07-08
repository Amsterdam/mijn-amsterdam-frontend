import {
  tableConfig,
  linkListItems,
  routeConfig,
  themaId,
  themaTitle,
} from './Burgerzaken-thema-config.ts';
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../hooks/useAppState.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

export function useBurgerZakenData() {
  const { BRP } = useAppStateGetter();

  const documents = addLinkElementToProperty(
    BRP.content?.identiteitsbewijzen ?? [],
    'documentType',
    true
  );

  const breadcrumbs = useThemaBreadcrumbs(themaId);

  return {
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
