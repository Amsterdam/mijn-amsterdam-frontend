import { tableConfig, themaConfig } from './Bezwaren-thema-config.ts';
import type { BezwaarFrontend } from '../../../../server/services/bezwaren/types.ts';
import { isError, isLoading } from '../../../../universal/helpers/api.ts';
import { addLinkElementToProperty } from '../../../components/Table/TableV2.tsx';
import { useAppStateGetter } from '../../../hooks/useAppStateStore.ts';
import { useThemaBreadcrumbs } from '../../../hooks/useThemaMenuItems.ts';

export function useBezwarenThemaData() {
  const { BEZWAREN } = useAppStateGetter();

  const bezwaren = addLinkElementToProperty<BezwaarFrontend>(
    BEZWAREN.content ?? [],
    'identificatie',
    true
  );

  const breadcrumbs = useThemaBreadcrumbs(themaConfig.id);

  return {
    bezwaren,
    isLoading: isLoading(BEZWAREN),
    isError: isError(BEZWAREN),
    pageLinks: themaConfig.pageLinks,
    tableConfig,
    themaId: themaConfig.id,
    themaTitle: themaConfig.title,
    breadcrumbs,
    themaConfig,
  };
}
