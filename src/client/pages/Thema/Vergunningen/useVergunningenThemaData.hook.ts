import {
  linkListItems,
  routeConfig,
  tableConfig,
  themaId,
  themaTitle,
} from './Vergunningen-thema-config';
import type { VergunningFrontend } from '../../../../server/services/vergunningen/config-and-types';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { addMaRouterLinkToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useVergunningenThemaData() {
  const { VERGUNNINGEN, PARKEREN } = useAppStateGetter();
  const vergunningen = addMaRouterLinkToProperty<VergunningFrontend>(
    VERGUNNINGEN.content ?? [],
    'identifier',
    true
  );
  const hasParkeervergunningen = !!PARKEREN.content?.vergunningen?.length;
  const breadcrumbs = useThemaBreadcrumbs(themaId);

  return {
    id: themaId,
    title: themaTitle,
    vergunningen,
    isLoading: isLoading(VERGUNNINGEN),
    isError: isError(VERGUNNINGEN),
    tableConfig,
    linkListItems,
    breadcrumbs,
    routeConfig,
    hasParkeervergunningen,
  };
}
