import { tableConfig, themaConfig } from './Klachten-thema-config';
import type { KlachtFrontend } from '../../../../server/services/klachten/types';
import { isError, isLoading } from '../../../../universal/helpers/api';
import { addLinkElementToProperty } from '../../../components/Table/TableV2';
import { useAppStateGetter } from '../../../hooks/useAppStateStore';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems';

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
