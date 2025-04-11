import { linkListItems, routes, tableConfig } from './Parkeren-thema-config';
import { DecosParkeerVergunning } from '../../../server/services/parkeren/config-and-types';
import { VergunningFrontend } from '../../../server/services/vergunningen/config-and-types';
import { ThemaIDs } from '../../../universal/config/thema';
import { isError, isLoading } from '../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../components/Table/TableV2';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useThemaBreadcrumbs } from '../../hooks/useThemaMenuItems';

export function useParkerenData() {
  const { PARKEREN } = useAppStateGetter();
  const hasMijnParkerenVergunningen = !!PARKEREN.content?.isKnown;

  const vergunningen = addLinkElementToProperty<
    VergunningFrontend<DecosParkeerVergunning>
  >(PARKEREN.content?.vergunningen ?? [], 'identifier', true);

  const breadcrumbs = useThemaBreadcrumbs(ThemaIDs.PARKEREN);

  return {
    title: ThemaTitles.PARKEREN,
    tableConfig,
    vergunningen,
    hasMijnParkerenVergunningen,
    isLoading: isLoading(PARKEREN),
    isError: isError(PARKEREN),
    parkerenUrlSSO: PARKEREN.content?.url ?? '/',
    isLoadingParkerenUrl: isLoading(PARKEREN),
    linkListItems,
    routes,
    breadcrumbs,
  };
}
