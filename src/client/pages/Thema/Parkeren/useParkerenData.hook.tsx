import {
  linkListItems,
  routeConfig,
  tableConfig,
  themaId,
  themaTitle,
} from './Parkeren-thema-config.ts';
import type { DecosParkeerVergunning } from '../../../../server/services/parkeren/config-and-types.ts';
import type { DecosZaakFrontend } from '../../../../server/services/vergunningen/config-and-types.ts';
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

export function useParkerenData() {
  const { PARKEREN } = useAppStateGetter();
  const hasMijnParkerenVergunningen = !!PARKEREN.content?.isKnown;

  const vergunningen = addLinkElementToProperty<
    DecosZaakFrontend<DecosParkeerVergunning>
  >(PARKEREN.content?.vergunningen ?? [], 'identifier', true);

  const breadcrumbs = useThemaBreadcrumbs(themaId);

  return {
    id: themaId,
    title: themaTitle,
    tableConfig,
    vergunningen,
    hasMijnParkerenVergunningen,
    isLoading: isLoading(PARKEREN),
    isError: isError(PARKEREN),
    parkerenUrlSSO: PARKEREN.content?.url ?? '/',
    isLoadingParkerenUrl: isLoading(PARKEREN),
    linkListItems,
    breadcrumbs,
    routeConfig,
  };
}
