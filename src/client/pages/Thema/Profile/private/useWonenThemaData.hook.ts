import { isError, isLoading } from '../../../../../universal/helpers/api.ts';
import { useAppStateGetter } from '../../../../hooks/useAppStateStore.ts';
import { useThemaBreadcrumbs } from '../../../../hooks/useThemaMenuItems.ts';
import { themaConfig } from '../Profile-thema-config.ts';

export function useWonenThemaData() {
  const { WONEN } = useAppStateGetter();
  const vve = WONEN.content?.vve;

  const breadcrumbs = useThemaBreadcrumbs(themaConfig.BRP.id);

  return {
    title: themaConfig.BRP.id,
    vve,
    isLoading: isLoading(WONEN),
    isError: isError(WONEN),
    breadcrumbs,
  };
}
