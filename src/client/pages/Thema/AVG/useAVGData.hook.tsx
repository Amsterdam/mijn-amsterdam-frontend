import { tableConfig, themaConfig } from './AVG-thema-config.ts';
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

export function useAVGData() {
  const { AVG } = useAppStateGetter();

  const avgVerzoeken = addLinkElementToProperty(
    AVG.content?.verzoeken ?? [],
    'id',
    true,
    (avg) => `Bekijk meer over avg verzoek met nummer ${avg.id}`
  );

  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);

  return {
    id: themaConfig.id,
    title: themaConfig.title,
    tableConfig,
    isLoading: isLoading(AVG),
    isError: isError(AVG),
    avgVerzoeken,
    pageLinks: themaConfig.pageLinks,
    breadcrumbs,
    themaConfig,
  };
}
