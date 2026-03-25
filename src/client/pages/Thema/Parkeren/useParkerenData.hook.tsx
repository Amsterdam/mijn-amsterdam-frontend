import {
  tableConfig, themaConfig,
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

  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);

  return {
    id: themaConfig.id,
    title: themaConfig.title,
    tableConfig,
    vergunningen,
    hasMijnParkerenVergunningen,
    isLoading: isLoading(PARKEREN),
    isError: isError(PARKEREN),
    parkerenUrlSSO: PARKEREN.content?.url ?? '/',
    isLoadingParkerenUrl: isLoading(PARKEREN),
    pageLinks: themaConfig.pageLinks,
    breadcrumbs,
    themaConfig,
  };
}
