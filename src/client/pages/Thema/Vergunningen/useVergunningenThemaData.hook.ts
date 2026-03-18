import { tableConfig, themaConfig } from './Vergunningen-thema-config.ts';
import type { ZaakFrontendCombined } from '../../../../server/services/vergunningen/config-and-types.ts';
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

export function useVergunningenThemaData() {
  const { VERGUNNINGEN, PARKEREN } = useAppStateGetter();
  const vergunningen = addLinkElementToProperty<ZaakFrontendCombined>(
    VERGUNNINGEN.content ?? [],
    'identifier',
    true
  );
  const hasParkeervergunningen = !!PARKEREN.content?.vergunningen?.length;
  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);

  return {
    id: themaConfig.id,
    title: themaConfig.title,
    vergunningen,
    isLoading: isLoading(VERGUNNINGEN),
    isError: isError(VERGUNNINGEN),
    tableConfig,
    pageLinks: themaConfig.pageLinks,
    breadcrumbs,
    hasParkeervergunningen,
    themaConfig,
  };
}
