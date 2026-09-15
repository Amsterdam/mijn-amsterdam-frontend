import {
  tableConfig,
  themaConfig,
  type ParkerenThemaConfig,
} from './Parkeren-thema-config.ts';
import type { DecosParkeerVergunning } from '../../../../server/services/parkeren/config-and-types.ts';
import type { DecosZaakFrontend } from '../../../../server/services/vergunningen/config-and-types.ts';
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { createThemaConfig } from '../../../config/create-thema-config.ts';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';
import { useProfileTypeValue } from '../../../hooks/useProfileType.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaBreadcrumbs.ts';

export function useParkerenData() {
  const { PARKEREN } = useAppStateGetter();
  const hasMijnParkerenVergunningen = !!PARKEREN.content?.isKnown;

  const vergunningen = addLinkElementToProperty<
    DecosZaakFrontend<DecosParkeerVergunning>
  >(PARKEREN.content?.vergunningen ?? [], 'identifier', true);

  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);

  const profileType = useProfileTypeValue();
  const resolvedThemaConfig = createThemaConfig<ParkerenThemaConfig>(
    themaConfig,
    profileType
  );

  return {
    id: resolvedThemaConfig.id,
    title: resolvedThemaConfig.title,
    tableConfig,
    vergunningen,
    hasMijnParkerenVergunningen,
    isLoading: isLoading(PARKEREN),
    isError: isError(PARKEREN),
    parkerenUrlSSO: PARKEREN.content?.url ?? '/',
    isLoadingParkerenUrl: isLoading(PARKEREN),
    pageLinks: resolvedThemaConfig.pageLinks,
    breadcrumbs,
    resolvedThemaConfig,
  };
}
