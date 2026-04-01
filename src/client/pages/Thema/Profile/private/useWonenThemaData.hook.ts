import { isError, isLoading } from '../../../../../universal/helpers/api.ts';
import { useAppStateGetter } from '../../../../hooks/useAppStateStore.ts';
import { useThemaBreadcrumbs } from '../../../../hooks/useThemaMenuItems.ts';
import { themaIdBRP as themaId, themaTitle } from '../Profile-thema-config.ts';

export function useWonenThemaData() {
  const { WONEN } = useAppStateGetter();
  const wonenData = WONEN.content;

  const breadcrumbs = useThemaBreadcrumbs(themaId);

  return {
    title: themaTitle,
    wonenData,
    isLoading: isLoading(WONEN),
    isError: isError(WONEN),
    breadcrumbs,
  };
}
