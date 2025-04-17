import { tableConfig, linkListItems, routes } from './BurgerZaken-thema-config';
import { ThemaIDs } from '../../../../universal/config/thema';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useBurgerZakenData() {
  const { BRP } = useAppStateGetter();

  const documents = addLinkElementToProperty(
    BRP.content?.identiteitsbewijzen ?? [],
    'documentType',
    true
  );

  const breadcrumbs = useThemaBreadcrumbs(ThemaIDs.BURGERZAKEN);

  return {
    tableConfig,
    linkListItems,
    isLoading: isLoading(BRP),
    isError: isError(BRP),
    documents,
    routes,
    breadcrumbs,
  };
}
