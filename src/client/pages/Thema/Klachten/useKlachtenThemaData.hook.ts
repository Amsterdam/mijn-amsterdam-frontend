import { tableConfig, themaConfig } from './Klachten-thema-config.ts';
import type { KlachtFrontend } from '../../../../server/services/klachten/types.ts';
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

export function useKlachtenThemaData() {
  const { KLACHTEN } = useAppStateGetter();

  const klachten = addLinkElementToProperty<KlachtFrontend>(
    KLACHTEN.content ?? [],
    'id',
    true,
    (klacht) => `Bekijk meer over klacht ${klacht.id}`
  );

  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);

  return {
    klachten,
    isLoading: isLoading(KLACHTEN),
    isError: isError(KLACHTEN),
    pageLinks: themaConfig.pageLinks,
    tableConfig,
    themaId: themaConfig.id,
    title: themaConfig.title,
    breadcrumbs,
    themaConfig,
  };
}
