import {
  klachtenTableConfig,
  LinkListItems,
  routeConfig,
  themaId,
  themaTitle,
} from './Klachten-thema-config';
import type { KlachtFrontend } from '../../../../server/services/klachten/types';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { addMaRouterLinkToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

export function useKlachtenThemaData() {
  const { KLACHTEN } = useAppStateGetter();

  const klachten = addMaRouterLinkToProperty<KlachtFrontend>(
    KLACHTEN.content ?? [],
    'id',
    true,
    (klacht) => `Bekijk meer over klacht ${klacht.id}`
  );

  const breadcrumbs = useThemaBreadcrumbs(themaId);

  return {
    klachten,
    isLoading: isLoading(KLACHTEN),
    isError: isError(KLACHTEN),
    linkListItems: LinkListItems,
    tableConfig: klachtenTableConfig,
    themaId,
    themaTitle,
    breadcrumbs,
    routeConfig,
  };
}
