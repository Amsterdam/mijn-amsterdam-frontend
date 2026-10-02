import { isError } from '../../../../../../../universal/helpers/api.ts';
import { useAppStateGetter } from '../../../../../../hooks/useAppStateStore.ts';
import { useIsLoading } from '../../../../../../hooks/useIsLoading.ts';
import { useThemaBreadcrumbs } from '../../../../../../hooks/useThemaBreadcrumbs.ts';
import { themaConfig } from '../Profile-thema-config.ts';

export function useWonenThemaData() {
  const { WONEN } = useAppStateGetter();
  const vve = WONEN.content?.vve;

  const breadcrumbs = useThemaBreadcrumbs(themaConfig.BRP.id);

  return {
    title: themaConfig.BRP.id,
    vve,
    isLoading: useIsLoading(WONEN),
    isError: isError(WONEN),
    breadcrumbs,
  };
}
