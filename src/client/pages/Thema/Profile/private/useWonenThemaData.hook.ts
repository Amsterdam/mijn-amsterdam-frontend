import { isError, isLoading } from '../../../../../universal/helpers/api';
import { useAppStateGetter } from '../../../../hooks/useAppStateStore';
import { useThemaBreadcrumbs } from '../../../../hooks/useThemaMenuItems';
import { themaIdBRP as themaId, themaTitle } from '../Profile-thema-config';

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
